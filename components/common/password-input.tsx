"use client";
import { useState, type InputHTMLAttributes } from "react";
import clsx from "clsx";
import { View, ViewOff } from "@carbon/icons-react";
import Input from "@/components/ui/input";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    invalid?: boolean;
    revealLabel: string;
}

export default function PasswordInput({ revealLabel, className, ...rest }: Props) {
    const [shown, setShown] = useState(false);
    const Icon = shown ? ViewOff : View;

    return (
        <div className="relative">
            <Input {...rest} type={shown ? "text" : "password"} className={clsx("pr-14", className)} />
            <button
                type="button"
                aria-pressed={shown}
                aria-label={revealLabel}
                onClick={() => setShown((current) => !current)}
                className="text-text-muted hover:text-text focus-visible:outline-text absolute inset-y-1 right-1 flex w-11 cursor-pointer items-center justify-center rounded-sm transition-colors focus-visible:outline-2"
            >
                <Icon aria-hidden className="size-5" />
            </button>
        </div>
    );
}
