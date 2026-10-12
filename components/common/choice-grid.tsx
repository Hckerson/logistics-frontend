import clsx from "clsx";
import FieldError, { fieldErrorId } from "@/components/common/field-error";
import type { ChoiceOption } from "@/lib/types";

interface Props<T extends string> {
    id: string;
    name: string;
    legend: string;
    index?: string;
    options: readonly ChoiceOption<T>[];
    value: T | null;
    columns?: 1 | 2 | 3;
    error?: string;
    disabled?: boolean;
    onChange: (value: T) => void;
}

export default function ChoiceGrid<T extends string>(props: Props<T>) {
    const { id, name, legend, index, options, value, columns = 1, error, disabled = false, onChange } = props;

    return (
        <fieldset
            id={id}
            tabIndex={-1}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? fieldErrorId(id) : undefined}
            className="flex flex-col outline-none"
        >
            <legend className={clsx("haulr-label mb-2 flex items-baseline gap-2.5", error ? "text-error" : "text-text-muted")}>
                {index ? <span>{index}</span> : null}
                {legend}
            </legend>
            <div className={clsx("grid gap-1", columns === 2 && "sm:grid-cols-2", columns === 3 && "grid-cols-3")}>
                {options.map((option) => (
                    <label
                        key={option.value}
                        className={clsx(
                            "has-focus-visible:outline-text flex cursor-pointer flex-col gap-0.5 border-l-2 px-3 py-2.5 transition-colors has-focus-visible:outline-2",
                            value === option.value
                                ? "border-accent bg-background-muted text-text"
                                : "border-border bg-background-muted/40 text-text-secondary hover:text-text",
                        )}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={value === option.value}
                            onChange={() => onChange(option.value)}
                            className="sr-only"
                        />
                        <span className="text-sm">{option.label}</span>
                        {option.detail ? <span className="text-text-muted text-xs">{option.detail}</span> : null}
                    </label>
                ))}
            </div>
            {error ? (
                <div className="mt-2">
                    <FieldError id={id} message={error} />
                </div>
            ) : null}
        </fieldset>
    );
}
