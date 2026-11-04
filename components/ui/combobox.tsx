"use client";
import clsx from "clsx";
import { useRef } from "react";
import { ChevronDown } from "@carbon/icons-react";
import { Button as AriaButton, ComboBox as AriaComboBox, Input, ListBox, useFilter, type Key } from "react-aria-components";
import FocusCorners from "@/components/ui/focus-corners";
import ListOption from "@/components/ui/list-option";
import Popover from "@/components/ui/popover";
import ProgressLine from "@/components/ui/progress-line";
import { fieldClass } from "@/lib/ui/classes";
import { FIELD_INPUT, ICON_SIZES } from "@/lib/ui/constants";
import { UI_COPY } from "@/lib/ui/copy";
import type { ChoiceOption, ControlSize, IconGlyph } from "@/lib/types";

interface Props<T extends string> {
    options: readonly ChoiceOption<T>[];
    value: T | null;
    onChange: (value: T | null) => void;
    inputValue?: string;
    onInputChange?: (value: string) => void;
    filter?: boolean;
    loading?: boolean;
    id?: string;
    name?: string;
    label?: string;
    size?: ControlSize;
    invalid?: boolean;
    placeholder?: string;
    icon?: IconGlyph;
    isRequired?: boolean;
    isDisabled?: boolean;
    className?: string;
    "aria-invalid"?: true;
    "aria-describedby"?: string;
    "aria-labelledby"?: string;
}

const keepAll = () => true;

export default function Combobox<T extends string>(props: Props<T>) {
    const { options, value, onChange, inputValue, onInputChange, filter = true, loading = false } = props;
    const { id, name, label, size = "md", invalid = false, placeholder, icon: Icon, isRequired, isDisabled, className } = props;
    const { contains } = useFilter({ sensitivity: "base" });
    const frame = useRef<HTMLDivElement>(null);

    const pick = (key: Key | null) => onChange(options.find((option) => option.value === key)?.value ?? null);

    return (
        <AriaComboBox
            name={name}
            value={value}
            onChange={pick}
            inputValue={inputValue}
            onInputChange={onInputChange}
            defaultFilter={filter ? contains : keepAll}
            allowsEmptyCollection
            isRequired={isRequired}
            isDisabled={isDisabled}
            isInvalid={invalid}
            aria-label={label}
            aria-labelledby={props["aria-labelledby"]}
            aria-describedby={props["aria-describedby"]}
            className={clsx("flex w-full min-w-0 flex-col", className)}
        >
            <div ref={frame} className={fieldClass(size, invalid)}>
                {Icon ? <Icon aria-hidden className={clsx(ICON_SIZES[size], "text-text-muted shrink-0")} /> : null}
                <Input id={id} placeholder={placeholder} aria-busy={loading || undefined} className={clsx(FIELD_INPUT, "caret-accent")} />
                <AriaButton className="text-text-muted hover:text-text -mr-1 grid shrink-0 cursor-pointer place-items-center p-1 outline-none">
                    <ChevronDown aria-hidden className={ICON_SIZES[size]} />
                </AriaButton>
                {loading ? <ProgressLine className="absolute inset-x-0 -bottom-px" /> : null}
                <FocusCorners invalid={invalid} />
            </div>
            <Popover triggerRef={frame} placement="bottom start" className="min-w-(--trigger-width)">
                <ListBox
                    className="max-h-72 overflow-y-auto py-1 outline-none"
                    renderEmptyState={() => <p className="text-text-muted px-3 py-2 text-xs">{loading ? UI_COPY.loading : UI_COPY.noResults}</p>}
                >
                    {options.map((option) => (
                        <ListOption
                            key={option.value}
                            id={option.value}
                            label={option.label}
                            detail={option.detail}
                            disabledReason={option.disabledReason}
                        />
                    ))}
                </ListBox>
            </Popover>
        </AriaComboBox>
    );
}
