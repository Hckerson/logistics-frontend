"use client";
import clsx from "clsx";
import { useId, useState, type KeyboardEvent } from "react";
import BoardField from "@/components/common/board-field";
import { ESTIMATOR_COPY } from "@/lib/data/quotes/estimator";
import { useDebouncedSearch } from "@/lib/hooks/use-debounced-search";
import { useLocationSuggestions } from "@/lib/hooks/use-location-suggestions";
import { PLACE_QUERY } from "@/lib/quotes/constants";

interface Props {
    id: string;
    index: string;
    label: string;
    placeholder: string;
    value: string;
    error?: string;
    onChange: (value: string) => void;
}

const { places } = ESTIMATOR_COPY;
const STEP: Record<string, number> = { ArrowDown: 1, ArrowUp: -1 };

export default function LocationField({ id, index, label, placeholder, value, error, onChange }: Props) {
    const listId = useId();
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);
    const { setSearch, debouncedSearch } = useDebouncedSearch(value, PLACE_QUERY.debounce);
    const suggestions = useLocationSuggestions(open ? debouncedSearch : "");
    const options = suggestions.data ?? [];
    const showing = open && value.trim().length >= PLACE_QUERY.min && suggestions.data !== undefined;
    const count = (options.length === 1 ? places.one : places.other).replace("{count}", String(options.length));

    const write = (next: string, keepOpen: boolean) => {
        onChange(next);
        setSearch(next);
        setOpen(keepOpen);
        setActive(-1);
    };

    const keys = (event: KeyboardEvent<HTMLInputElement>) => {
        const step = STEP[event.key];
        if (step) {
            event.preventDefault();
            setOpen(true);
            setActive((current) => (options.length ? (current + step + options.length) % options.length : -1));
        } else if ((event.key === "Enter" || event.key === "Tab") && showing && active >= 0) {
            if (event.key === "Enter") event.preventDefault();
            write(options[active].name, false);
        } else if (event.key === "Escape") {
            if (open) setOpen(false);
            else write("", false);
        }
    };

    return (
        <div className="relative">
            <BoardField
                id={id}
                index={index}
                label={label}
                placeholder={placeholder}
                value={value}
                error={error}
                role="combobox"
                autoComplete="off"
                spellCheck={false}
                aria-autocomplete="list"
                aria-expanded={showing}
                aria-controls={listId}
                aria-busy={suggestions.isFetching}
                aria-activedescendant={showing && active >= 0 ? `${listId}-${active}` : undefined}
                onChange={(event) => write(event.target.value, true)}
                onKeyDown={keys}
                onBlur={() => setOpen(false)}
            />
            {showing ? (
                <ul
                    id={listId}
                    role="listbox"
                    aria-label={places.list.replace("{field}", label)}
                    className="border-border-dark bg-background absolute inset-x-0 top-full z-30 mt-1 flex flex-col border py-1 shadow-[0_16px_40px_-16px_rgb(0_0_0/0.9)]"
                >
                    {options.length === 0 ? (
                        <li role="option" aria-selected={false} aria-disabled className="text-text-muted px-3 py-2 text-xs">
                            {places.none}
                        </li>
                    ) : null}
                    {options.map((place, position) => (
                        <li
                            key={place.code}
                            id={`${listId}-${position}`}
                            role="option"
                            aria-selected={position === active}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => write(place.name, false)}
                            className={clsx(
                                "flex cursor-pointer items-baseline justify-between gap-4 px-3 py-2 text-sm transition-colors",
                                position === active ? "bg-background-muted text-text" : "text-text-secondary hover:bg-background-muted/60 hover:text-text",
                            )}
                        >
                            <span>{place.name}</span>
                            <span className="haulr-label text-text-muted">{place.code}</span>
                        </li>
                    ))}
                </ul>
            ) : null}
            <p aria-live="polite" className="sr-only">
                {showing ? count : ""}
            </p>
        </div>
    );
}
