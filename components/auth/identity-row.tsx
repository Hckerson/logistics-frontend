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
        <div className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-4 text-sm">
                <p className="text-text-muted">{label}</p>
                <button
                    type="button"
                    onClick={onChange}
                    aria-label={changeLabel}
                    disabled={disabled}
                    className={clsx(QUIET_LINK, "cursor-pointer disabled:opacity-40")}
                >
                    {change}
                </button>
            </div>
            <p className={clsx("text-text truncate text-sm", mono && "font-mono")}>{value}</p>
        </div>
    );
}
