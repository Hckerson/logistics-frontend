"use client";
import Combobox from "@/components/ui/combobox";
import Field from "@/components/ui/field";
import { useDebouncedSearch } from "@/lib/hooks/use-debounced-search";
import { useLocationSuggestions } from "@/lib/hooks/use-location-suggestions";
import { PLACE_QUERY } from "@/lib/quotes/constants";
import type { ChoiceOption } from "@/lib/types";
import { pluralize } from "@/lib/utils/plural";

interface Props {
    id: string;
    index?: string;
    label: string;
    placeholder: string;
    value: string;
    error?: string;
    places: { one: string; other: string; none: string };
    onChange: (value: string) => void;
}

export default function LocationField({ id, index, label, placeholder, value, error, places, onChange }: Props) {
    const { setSearch, debouncedSearch } = useDebouncedSearch(value, PLACE_QUERY.debounce);
    const suggestions = useLocationSuggestions(debouncedSearch);
    const searched = value.trim().length >= PLACE_QUERY.min && suggestions.data !== undefined;
    const options: ChoiceOption<string>[] = searched ? (suggestions.data ?? []).map(({ code, name }) => ({ value: name, label: name, detail: code })) : [];

    const type = (next: string) => {
        onChange(next);
        setSearch(next);
    };

    return (
        <Field id={id} label={label} index={index} error={error}>
            {(control) => (
                <>
                    <Combobox
                        {...control}
                        options={options}
                        value={options.find((option) => option.value === value)?.value ?? null}
                        onChange={(picked) => {
                            if (picked !== null) type(picked);
                        }}
                        inputValue={value}
                        onInputChange={type}
                        filter={false}
                        loading={suggestions.isFetching}
                        placeholder={placeholder}
                        allowsCustomValue
                        allowsEmpty={searched}
                        emptyLabel={places.none}
                    />
                    <p aria-live="polite" className="sr-only">
                        {searched ? pluralize(options.length, places) : ""}
                    </p>
                </>
            )}
        </Field>
    );
}
