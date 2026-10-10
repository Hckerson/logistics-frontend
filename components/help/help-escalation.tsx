import ConsoleLink from "@/components/auth/console-link";
import HudCorners from "@/components/common/hud-corners";
import SupportHours from "@/components/support/support-hours";
import { supportRoute } from "@/lib/constants";
import { HELP_COPY } from "@/lib/data/help/copy";
import type { SupportContext } from "@/lib/types";

interface Props {
    context: SupportContext;
}

const { escalation } = HELP_COPY;

export default function HelpEscalation({ context }: Props) {
    return (
        <div className="border-border/70 bg-background/85 relative flex flex-col gap-5 border p-5">
            <HudCorners />
            <div className="flex flex-col gap-1.5">
                <p className="haulr-label text-accent">{escalation.label}</p>
                <p className="text-text-secondary text-sm">{escalation.body}</p>
            </div>
            <SupportHours />
            <ConsoleLink href={supportRoute(context)} label={escalation.action} />
        </div>
    );
}
