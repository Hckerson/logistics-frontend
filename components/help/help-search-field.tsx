import { Search } from "@carbon/icons-react";
import Input from "@/components/ui/input";
import { HELP_QUERY } from "@/lib/help/constants";
import { HELP_COPY } from "@/lib/data/help/copy";

interface Props {
    id: string;
    value: string;
    unavailable: boolean;
    onChange: (value: string) => void;
    onFocus: () => void;
}

const { search } = HELP_COPY;

export default function HelpSearchField({ id, value, unavailable, onChange, onFocus }: Props) {
    return (
        <div role="search" className="flex flex-col gap-2">
            <label htmlFor={id} className="haulr-label text-text-muted">
                {search.label}
            </label>
            <div className="relative">
                <Search aria-hidden className="text-text-muted pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2" />
                <Input
                    id={id}
                    type="search"
                    name={HELP_QUERY}
                    autoComplete="off"
                    spellCheck={false}
                    value={value}
                    placeholder={search.placeholder}
                    onChange={(event) => onChange(event.target.value)}
                    onFocus={onFocus}
                    className="pl-12"
                />
            </div>
            {unavailable ? <p className="text-text-muted text-xs">{search.unavailable}</p> : null}
        </div>
    );
}
