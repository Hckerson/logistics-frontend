"use client";
import clsx from "clsx";
import { SHELL_COPY } from "@/lib/data/shell";
import { useConnectivity } from "@/lib/hooks/use-connectivity";
import { UI_LOCALE } from "@/lib/ui/constants";
import { fillTemplate } from "@/lib/utils/fill-template";

const { connectivity: copy } = SHELL_COPY;
const clock = new Intl.DateTimeFormat(UI_LOCALE, { hour: "numeric", minute: "2-digit" });

export default function ConnectivityBar() {
    const { state, since } = useConnectivity();
    const text = state === "offline" ? fillTemplate(copy.offline, { time: since === null ? "" : clock.format(since) }) : state === "back" ? copy.back : "";

    return (
        <div role="status">
            {text ? (
                <p
                    className={clsx(
                        "border-b text-xs",
                        state === "offline" ? "border-signal-warning-edge bg-signal-warning-wash text-signal-warning" : "border-signal-success-edge bg-signal-success-wash text-signal-success",
                    )}
                >
                    <span className="haulr-shell block py-1.5">{text}</span>
                </p>
            ) : null}
        </div>
    );
}
