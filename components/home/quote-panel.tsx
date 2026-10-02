import PanelFrame from "@/components/home/panel-frame";
import PanelRows from "@/components/home/panel-rows";
import { QUOTE_PANEL as PANEL } from "@/lib/data/home/panels";

export default function QuotePanel() {
    return (
        <PanelFrame label={PANEL.label} status={PANEL.status} summary={PANEL.summary}>
            <p className="text-text text-lg">
                {PANEL.from} <span className="text-accent">→</span> {PANEL.to}
            </p>
            <PanelRows rows={PANEL.facts} />
            <div className="border-border flex items-end justify-between gap-4 border-t pt-5">
                <p className="text-text font-mono text-5xl tracking-tight tabular-nums">{PANEL.rate}</p>
                <p className="text-text-muted pb-1 text-sm">{PANEL.perMile}</p>
            </div>
            <div className="flex flex-col gap-2">
                <div className="bg-background-muted relative h-1.5 rounded-full">
                    <span className="bg-accent/40 absolute inset-y-0 right-[18%] left-[18%] rounded-full" />
                    <span
                        className="bg-accent absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
                        style={{ left: `${PANEL.range.marker}%` }}
                    />
                </div>
                <div className="text-text-muted flex justify-between font-mono text-xs">
                    <span>{PANEL.range.low}</span>
                    <span>{PANEL.range.label}</span>
                    <span>{PANEL.range.high}</span>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <p className="bg-accent text-text-inverse flex h-11 items-center justify-center rounded-sm font-medium">
                    {PANEL.action}
                </p>
                <p className="text-text-muted text-center text-xs">{PANEL.validity}</p>
            </div>
        </PanelFrame>
    );
}
