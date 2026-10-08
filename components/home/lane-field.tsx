import type { ChangeEvent } from "react";
import Input from "@/components/ui/input";

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
            <Input
                id={id}
                name={name}
                type="text"
                list={list}
                autoComplete="off"
                required
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </div>
    );
}
