import clsx from "clsx";
import { ArrowRight, Checkmark } from "@carbon/icons-react";
import ProgressLine from "@/components/auth/progress-line";
import { CONSOLE_ACTION } from "@/lib/auth/constants";
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
        <button type="submit" aria-disabled={busy} className={clsx(CONSOLE_ACTION, "aria-disabled:cursor-wait")}>
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
            {pending ? <ProgressLine className="bg-text-inverse/15 absolute inset-x-0 bottom-0" /> : null}
        </button>
    );
}
