import clsx from "clsx";
import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import FocusCorners from "@/components/ui/focus-corners";
import { fieldClass } from "@/lib/ui/classes";
import { FIELD_INPUT, ICON_SIZES, LABEL_TEXT } from "@/lib/ui/constants";
import type { ControlSize, IconGlyph } from "@/lib/types";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
    size?: ControlSize;
    invalid?: boolean;
    icon?: IconGlyph;
    unit?: string;
    end?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, Props>(function Input(props, ref) {
    const { size = "md", invalid = false, icon: Icon, unit, end, className, ...rest } = props;

    return (
        <span className={fieldClass(size, invalid, className)}>
            {Icon ? <Icon aria-hidden className={clsx(ICON_SIZES[size], "text-text-muted shrink-0")} /> : null}
            <input
                {...rest}
                ref={ref}
                aria-invalid={invalid || rest["aria-invalid"] || undefined}
                className={clsx(FIELD_INPUT, "caret-accent")}
            />
            {unit ? (
                <span aria-hidden className={clsx(LABEL_TEXT, "shrink-0")}>
                    {unit}
                </span>
            ) : null}
            {end}
            <FocusCorners invalid={invalid} />
        </span>
    );
});

Input.displayName = "Input";

export default Input;
