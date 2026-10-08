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
                "bg-background text-text placeholder:text-text-muted h-12 w-full rounded-sm border px-4 text-base transition-colors duration-300",
                "focus-visible:border-text read-only:text-text-secondary focus-visible:outline-none",
                invalid ? "border-error" : "border-border-dark hover:border-text-muted",
                className,
            )}
        />
    );
});

Input.displayName = "Input";

export default Input;
