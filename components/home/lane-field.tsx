import type { ChangeEvent } from "react";

interface Props {
    id: string;
    name: string;
    label: string;
    placeholder: string;
    list: string;
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export default function LaneField({ id, name, label, placeholder, list, value, onChange }: Props) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="haulr-label text-text-muted">
                {label}
            </label>
            <input
                id={id}
                name={name}
                type="text"
                list={list}
                autoComplete="off"
                required
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="border-border-dark bg-background text-text placeholder:text-text-muted focus:border-text h-14 w-full rounded-sm border px-4 text-lg transition-colors focus:outline-none"
            />
        </div>
    );
}
