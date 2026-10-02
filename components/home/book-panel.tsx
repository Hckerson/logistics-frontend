import { CheckmarkFilled } from "@carbon/icons-react";
import PanelFrame from "@/components/home/panel-frame";
import { BOOK_PANEL as PANEL } from "@/lib/data/home/panels";

export default function BookPanel() {
    return (
        <PanelFrame label={PANEL.label} status={PANEL.status} summary={PANEL.summary}>
            <div className="flex flex-col gap-1">
                <p className="text-text text-lg">{PANEL.carrier.name}</p>
                <p className="text-text-muted text-sm">{PANEL.carrier.detail}</p>
            </div>
            <ul className="flex flex-col gap-2.5">
                {PANEL.checks.map((check) => (
                    <li key={check.id} className="flex items-center gap-3 text-sm">
                        <CheckmarkFilled className="text-success size-4 shrink-0" />
                        <span className="text-text-secondary">{check.label}</span>
                        <span className="text-text ml-auto font-mono">{check.value}</span>
                    </li>
                ))}
            </ul>
            <ol className="border-border flex flex-col gap-3 border-t pt-5">
                {PANEL.timeline.map((step, index) => (
                    <li key={step.id} className="flex items-baseline gap-3 text-sm">
                        <span className="text-text-muted w-12 font-mono tabular-nums">{step.value}</span>
                        <span
                            className={index === PANEL.timeline.length - 1 ? "text-accent" : "text-text-secondary"}
                        >
                            {step.label}
                        </span>
                    </li>
                ))}
            </ol>
        </PanelFrame>
    );
}
