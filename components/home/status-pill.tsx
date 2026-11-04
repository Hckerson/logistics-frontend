import StatusLabel from "@/components/ui/status-label";
import type { ConsoleLoad, SignalTone } from "@/lib/types";

interface Props {
    tone: ConsoleLoad["tone"];
    children: string;
}

const TONES: Record<ConsoleLoad["tone"], SignalTone> = { live: "live", done: "success", idle: "neutral" };

export default function StatusPill({ tone, children }: Props) {
    return <StatusLabel label={children} tone={TONES[tone]} pulse={tone === "live"} tag />;
}
