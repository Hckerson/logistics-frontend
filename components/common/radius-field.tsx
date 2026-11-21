"use client";
import clsx from "clsx";
import { useId, useState } from "react";
import FieldLabel, { fieldLabelId } from "@/components/ui/field-label";
import Input from "@/components/ui/input";
import Slider from "@/components/ui/slider";
import { LOAD_BOARD_COPY } from "@/lib/data/load-board/copy";
import { LOAD_BOARD } from "@/lib/load-board/constants";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    id: string;
    label: string;
    value: number;
    onChange: (value: number) => void;
    isDisabled?: boolean;
}

const { search: copy } = LOAD_BOARD_COPY;
const { radius } = LOAD_BOARD;

const clamp = (miles: number) => Math.min(Math.max(Math.round(miles / radius.step) * radius.step, radius.min), radius.max);

export default function RadiusField({ id, label, value, onChange, isDisabled = false }: Props) {
    const noteId = useId();
    const [typed, setTyped] = useState<string | null>(null);
    const [note, setNote] = useState<string | null>(null);

    const commit = () => {
        if (typed === null) return;
        const miles = Number(typed);
        const next = Number.isFinite(miles) ? clamp(miles) : value;
        setNote(miles > radius.max ? copy.radiusClamped.max : miles < radius.min ? copy.radiusClamped.min : null);
        setTyped(null);
        onChange(next);
    };

    return (
        <div className="flex min-w-0 flex-col">
            <FieldLabel htmlFor={id} label={label} />
            <div className="flex items-center gap-3">
                <Slider
                    aria-labelledby={fieldLabelId(id)}
                    aria-describedby={isDisabled || note ? noteId : undefined}
                    min={radius.min}
                    max={radius.max}
                    step={radius.step}
                    value={value}
                    onChange={(next) => {
                        setNote(null);
                        onChange(next);
                    }}
                    format={copy.radiusUnit}
                    isDisabled={isDisabled}
                />
                <Input
                    id={id}
                    size="sm"
                    inputMode="numeric"
                    aria-labelledby={fieldLabelId(id)}
                    value={typed ?? String(value)}
                    disabled={isDisabled}
                    onChange={(event) => setTyped(event.target.value)}
                    onBlur={commit}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") commit();
                    }}
                    className="w-16 shrink-0 text-right font-mono tabular-nums"
                />
            </div>
            <div role="group" aria-label={copy.radiusPresets} className="flex flex-wrap gap-1">
                {radius.presets.map((miles) => (
                    <button
                        key={miles}
                        type="button"
                        disabled={isDisabled}
                        aria-pressed={value === miles}
                        onClick={() => {
                            setNote(null);
                            onChange(miles);
                        }}
                        className={clsx(
                            "haulr-label focus-visible:outline-text min-h-9 px-2 transition-colors outline-none focus-visible:outline-2 disabled:opacity-40",
                            value === miles ? "text-accent" : "text-text-muted hover:text-text",
                        )}
                    >
                        {fillTemplate(copy.radiusPreset, { miles: String(miles) })}
                    </button>
                ))}
            </div>
            {isDisabled || note ? (
                <p id={noteId} role={note ? "status" : undefined} className="text-text-muted text-xs">
                    {isDisabled ? copy.radiusNeedsPlace : note}
                </p>
            ) : null}
        </div>
    );
}
