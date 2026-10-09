import { ArrowRight, Checkmark } from "@carbon/icons-react";
import { AUTH_COPY } from "@/lib/data/auth/shared";

interface Props {
    label: string;
    pendingLabel?: string;
    doneLabel?: string;
    pending?: boolean;
    done?: boolean;
}

export default function AuthSubmit({ label, pendingLabel, doneLabel, pending = false, done = false }: Props) {
    const busy = pending || done;

    return (
        <button
            type="submit"
            aria-disabled={busy}
            className="group bg-text text-text-inverse hover:bg-text-secondary focus-visible:outline-text relative flex h-12 w-full cursor-pointer items-center justify-between overflow-hidden px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 aria-disabled:cursor-wait"
        >
            <span className="flex items-center gap-2">
                {done ? doneLabel : pending ? pendingLabel : label}
                {done ? <Checkmark aria-hidden className="size-4" /> : null}
            </span>
            {busy ? null : (
                <span aria-hidden className="haulr-label flex items-center gap-2 opacity-60">
                    {AUTH_COPY.enter}
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
            )}
            {pending ? (
                <span aria-hidden className="bg-text-inverse/15 absolute inset-x-0 bottom-0 h-0.5 overflow-hidden">
                    <span className="haulr-progress bg-accent block h-full w-1/3" />
                </span>
            ) : null}
        </button>
    );
}
