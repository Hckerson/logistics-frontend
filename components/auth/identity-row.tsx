import clsx from "clsx";
import { QUIET_LINK } from "@/lib/auth/constants";

interface Props {
    label: string;
    value: string;
    change: string;
    changeLabel: string;
    disabled: boolean;
    mono?: boolean;
    onChange: () => void;
}

export default function IdentityRow({ label, value, change, changeLabel, disabled, mono = false, onChange }: Props) {
    return (
        <div className="bg-background-muted/30 border-border flex items-center justify-between gap-4 border-l-2 py-2.5 pr-3 pl-3.5">
            <div className="flex min-w-0 flex-col gap-1">
                <p className="haulr-label text-text-muted">{label}</p>
                <p className={clsx("text-text truncate text-sm", mono && "font-mono")}>{value}</p>
            </div>
            <button
                type="button"
                onClick={onChange}
                aria-label={changeLabel}
                disabled={disabled}
                className={clsx(QUIET_LINK, "shrink-0 cursor-pointer disabled:opacity-40")}
            >
                {change}
            </button>
        </div>
    );
}
