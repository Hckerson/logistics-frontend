"use client";
import clsx from "clsx";
import { forwardRef, useState, type InputHTMLAttributes, type ReactNode, type SyntheticEvent } from "react";
import { View, ViewOff } from "@carbon/icons-react";
import BoardCells from "@/components/common/board-cells";
import FieldError, { fieldErrorId } from "@/components/common/field-error";
import FieldLabel from "@/components/common/field-label";
import HudCorners from "@/components/common/hud-corners";
import { useAssembly } from "@/components/providers/assembly-provider";
import { boardWindow } from "@/lib/auth/board";
import { BOARD } from "@/lib/auth/constants";
import { useBoardNoise } from "@/lib/hooks/use-board-noise";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "value"> {
    id: string;
    label: string;
    value: string;
    index?: string;
    error?: string;
    aside?: ReactNode;
    hint?: ReactNode;
    revealLabel?: string;
    describedBy?: string;
    cells?: number;
    tall?: boolean;
}

const BoardField = forwardRef<HTMLInputElement, Props>(function BoardField(props, ref) {
    const { id, label, value, index, error, aside, hint, revealLabel, describedBy, cells = BOARD.cells, tall, type, placeholder, ...rest } = props;
    const { onChange, onSelect, onFocus, onBlur, ...native } = rest;
    const [shown, setShown] = useState(false);
    const [caret, setCaret] = useState<number | null>(null);
    const noise = useBoardNoise(cells, useAssembly());
    const secret = revealLabel !== undefined;
    const ghost = !value && caret === null && Boolean(placeholder);
    const text = ghost ? (placeholder ?? "") : secret && !shown ? BOARD.mask.repeat(value.length) : value;
    const board = boardWindow(text, caret, cells, native.maxLength !== undefined && native.maxLength <= cells);
    const Icon = shown ? ViewOff : View;

    const track = (event: SyntheticEvent<HTMLInputElement>) =>
        setCaret(event.currentTarget.selectionStart ?? event.currentTarget.value.length);

    return (
        <div className="group/field flex flex-col">
            <FieldLabel htmlFor={id} label={label} index={index} error={Boolean(error)} aside={aside} />
            <div className="relative flex items-stretch gap-1">
                <div className="relative min-w-0 flex-1">
                    <BoardCells glyphs={board.glyphs} caret={board.caret} ghost={ghost} noise={noise} error={Boolean(error)} tall={tall} />
                    <input
                        {...native}
                        ref={ref}
                        id={id}
                        value={value}
                        placeholder={placeholder}
                        type={secret ? (shown ? "text" : "password") : type}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={clsx(describedBy, error && fieldErrorId(id)) || undefined}
                        onChange={(event) => {
                            onChange?.(event);
                            track(event);
                        }}
                        onSelect={(event) => {
                            onSelect?.(event);
                            track(event);
                        }}
                        onFocus={(event) => {
                            onFocus?.(event);
                            track(event);
                        }}
                        onBlur={(event) => {
                            onBlur?.(event);
                            setCaret(null);
                        }}
                        className="absolute inset-0 w-full cursor-text bg-transparent text-base text-transparent caret-transparent outline-none selection:bg-transparent placeholder:text-transparent autofill:[transition:background-color_600000s_0s] autofill:[-webkit-text-fill-color:transparent]"
                    />
                </div>
                {secret ? (
                    <button
                        type="button"
                        aria-pressed={shown}
                        aria-label={revealLabel}
                        onClick={() => setShown((current) => !current)}
                        className="bg-background-muted text-text-muted hover:text-text aria-pressed:text-accent focus-visible:outline-text grid w-10 shrink-0 cursor-pointer place-items-center transition-colors focus-visible:outline-2"
                    >
                        <Icon aria-hidden className="size-4" />
                    </button>
                ) : null}
                <HudCorners
                    tone={error ? "error" : "accent"}
                    className={clsx(
                        "transition-[opacity,scale] duration-300 ease-out group-focus-within/field:scale-100 group-focus-within/field:opacity-100",
                        error ? "scale-100 opacity-100" : "scale-150 opacity-0",
                    )}
                />
            </div>
            <span aria-live="polite" className="haulr-label text-accent mt-2 empty:mt-0">
                {hint}
            </span>
            {error ? (
                <div className="mt-2">
                    <FieldError id={id} message={error} />
                </div>
            ) : null}
        </div>
    );
});

BoardField.displayName = "BoardField";

export default BoardField;
