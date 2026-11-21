"use client";
import { Location } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import { DRIVER_COPY } from "@/lib/data/driver/copy";
import type { LocationState } from "@/lib/types";

interface Props {
    state: LocationState;
    onEnable: () => void;
}

const { location: copy } = DRIVER_COPY;

export default function DriverLocationNotice({ state, onEnable }: Props) {
    if (state === "granted") return null;

    return (
        <div role="status" className="border-signal-warning flex flex-col items-start gap-3 border-l-2 py-1 pl-3 text-xs sm:flex-row sm:items-center sm:justify-between">
            <p className="text-text-secondary min-w-0 sm:flex-1">{state === "denied" ? copy.help : state === "unsupported" ? copy.states.unsupported : copy.off}</p>
            {state === "prompt" ? (
                <Button tone="outline" size="lg" icon={Location} onPress={onEnable}>
                    {copy.enable}
                </Button>
            ) : null}
        </div>
    );
}
