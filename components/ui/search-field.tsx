"use client";
import clsx from "clsx";
import { Close, Search } from "@carbon/icons-react";
import { Button, Input, SearchField as AriaSearchField } from "react-aria-components";
import FocusCorners from "@/components/ui/focus-corners";
import Kbd from "@/components/ui/kbd";
import { fieldClass } from "@/lib/ui/classes";
import { FIELD_INPUT, ICON_SIZES } from "@/lib/ui/constants";
import { UI_COPY } from "@/lib/ui/copy";
import type { ControlSize } from "@/lib/types";

interface Props {
    label: string;
    value: string;
    onChange: (value: string) => void;
    onSubmit?: (value: string) => void;
    placeholder?: string;
    shortcut?: readonly string[];
    size?: ControlSize;
    name?: string;
    id?: string;
    autoFocus?: boolean;
    className?: string;
}

export default function SearchField(props: Props) {
    const { label, value, onChange, onSubmit, placeholder, shortcut, size = "md", name, id, autoFocus, className } = props;

    return (
        <AriaSearchField
            aria-label={label}
            value={value}
            onChange={onChange}
            onSubmit={onSubmit}
            name={name}
            id={id}
            autoFocus={autoFocus}
            className={fieldClass(size, false, className)}
        >
            <Search aria-hidden className={clsx(ICON_SIZES[size], "text-text-muted shrink-0")} />
            <Input
                placeholder={placeholder}
                className={clsx(FIELD_INPUT, "caret-accent [&::-webkit-search-cancel-button]:hidden")}
            />
            {value ? (
                <Button
                    aria-label={UI_COPY.clear}
                    className="text-text-muted hover:text-text data-focus-visible:outline-text grid size-6 shrink-0 cursor-pointer place-items-center outline-none data-focus-visible:outline-2"
                >
                    <Close aria-hidden className={ICON_SIZES[size]} />
                </Button>
            ) : shortcut ? (
                <Kbd keys={shortcut} />
            ) : null}
            <FocusCorners />
        </AriaSearchField>
    );
}
