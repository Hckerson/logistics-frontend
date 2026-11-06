import StatusLabel from "@/components/ui/status-label";
import type { ConsoleLoad, SignalTone } from "@/lib/types";

interface Props {
    tone: ConsoleLoad["tone"];
    children: string;
}

const TONES: Record<ConsoleLoad["tone"], SignalTone> = { live: "live", done: "success", idle: "neutral" };

const STAGES: Record<ConsoleLoad["tone"], number> = { live: 0.62, done: 1, idle: 0.2 };

export default function StatusPill({ tone, children }: Props) {
    return <StatusLabel label={children} tone={TONES[tone]} pulse={tone === "live"} stage={STAGES[tone]} />;
}
