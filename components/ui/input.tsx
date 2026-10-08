import clsx from "clsx";
import { forwardRef, type InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
    invalid?: boolean;
}

const Input = forwardRef<HTMLInputElement, Props>(function Input({ invalid = false, className, ...rest }, ref) {
    return (
        <input
            {...rest}
            ref={ref}
            aria-invalid={invalid || undefined}
            className={clsx(
                "bg-background text-text placeholder:text-text-muted caret-accent h-14 w-full rounded-sm border px-4 text-lg transition-colors focus:outline-none",
                "read-only:text-text-secondary autofill:shadow-[inset_0_0_0_100vmax_var(--colors-background)] autofill:[-webkit-text-fill-color:var(--colors-text)]",
                invalid ? "border-error focus:border-error" : "border-border-dark hover:border-text-muted focus:border-text",
                className,
            )}
        />
    );
});

Input.displayName = "Input";

export default Input;
