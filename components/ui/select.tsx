"use client";
import clsx from "clsx";
import { ChevronDown } from "@carbon/icons-react";
import { Button as AriaButton, ListBox, Select as AriaSelect, SelectValue, type Key } from "react-aria-components";
import HudCorners from "@/components/ui/hud-corners";
import ListOption from "@/components/ui/list-option";
import Popover from "@/components/ui/popover";
import { fieldClass } from "@/lib/ui/classes";
import { FOCUS_CORNERS, ICON_SIZES } from "@/lib/ui/constants";
import type { ChoiceOption, ControlSize } from "@/lib/types";

interface Props<T extends string> {
    options: readonly ChoiceOption<T>[];
    value: T | null;
    onChange: (value: T) => void;
    id?: string;
    name?: string;
    label?: string;
    size?: ControlSize;
    invalid?: boolean;
    placeholder?: string;
    isRequired?: boolean;
    isDisabled?: boolean;
    className?: string;
    "aria-invalid"?: true;
    "aria-describedby"?: string;
    "aria-labelledby"?: string;
}

const OPEN_CORNERS = "group-aria-expanded/control:scale-100 group-aria-expanded/control:opacity-100";

export default function Select<T extends string>(props: Props<T>) {
    const { options, value, onChange, id, name, label, size = "md", invalid = false, placeholder, isRequired, isDisabled, className } = props;

    const pick = (key: Key | null) => {
        const option = options.find((candidate) => candidate.value === key);
        if (option) onChange(option.value);
    };

    return (
        <AriaSelect
            name={name}
            value={value}
            onChange={pick}
            placeholder={placeholder}
            isRequired={isRequired}
            isDisabled={isDisabled}
            isInvalid={invalid}
            aria-label={label}
            aria-labelledby={props["aria-labelledby"]}
            aria-describedby={props["aria-describedby"]}
            className={clsx("flex w-full min-w-0 flex-col", className)}
        >
            <AriaButton id={id} className={fieldClass(size, invalid, "cursor-pointer text-left outline-none")}>
                <SelectValue className={({ isPlaceholder }) => clsx("min-w-0 flex-1 truncate", isPlaceholder && "text-text-muted")} />
                <ChevronDown
                    aria-hidden
                    className={clsx(ICON_SIZES[size], "text-text-muted shrink-0 transition-transform duration-200 group-aria-expanded/control:rotate-180")}
                />
                <HudCorners
                    tone={invalid ? "error" : "accent"}
                    className={clsx(FOCUS_CORNERS.motion, OPEN_CORNERS, invalid ? FOCUS_CORNERS.shown : FOCUS_CORNERS.hidden)}
                />
            </AriaButton>
            <Popover placement="bottom start" className="min-w-(--trigger-width)">
                <ListBox className="max-h-72 overflow-y-auto py-1 outline-none">
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
        </AriaSelect>
    );
}
