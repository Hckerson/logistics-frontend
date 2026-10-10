import ConsoleLink from "@/components/auth/console-link";
import BoardCells from "@/components/common/board-cells";
import HudPanel from "@/components/common/hud-panel";
import PanelRows from "@/components/home/panel-rows";
import PrintButton from "@/components/legal/print-button";
import { legalRoute } from "@/lib/constants";
import { LEGAL_COPY } from "@/lib/data/legal/copy";
import { VERSION_CELL_REM } from "@/lib/legal/constants";
import { legalDate } from "@/lib/legal/edition";
import type { LegalEdition } from "@/lib/types";

interface Props {
    found: LegalEdition;
}

const { record } = LEGAL_COPY;

export default function LegalRecord({ found }: Props) {
    const { document, edition, replacedBy } = found;
    const glyphs = edition.version.split("");
    const rows = [
        { id: "effective", label: record.effective, value: legalDate(edition.effective) },
        ...(replacedBy ? [{ id: "replaced", label: record.replaced, value: legalDate(replacedBy.effective) }] : []),
        { id: "broker", label: record.broker, value: record.brokerValue },
    ];

    return (
        <HudPanel
            label={record.label}
            status={replacedBy ? record.superseded : record.current}
            alert={Boolean(replacedBy)}
            note={LEGAL_COPY.note}
        >
            <div className="flex items-end justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <p className="haulr-label text-text-muted">{record.version}</p>
                    <div style={{ width: `${glyphs.length * VERSION_CELL_REM}rem` }}>
                        <BoardCells glyphs={glyphs} caret={null} ghost={false} noise={null} error={false} tall />
                    </div>
                </div>
                <PrintButton />
            </div>
            <PanelRows rows={rows} />
            {replacedBy ? (
                <>
                    <p className="text-text-secondary text-sm">
                        {LEGAL_COPY.supersededBody
                            .replace("{version}", replacedBy.version)
                            .replace("{date}", legalDate(replacedBy.effective))}
                    </p>
                    <div className="print:hidden">
                        <ConsoleLink href={legalRoute(document.key)} label={LEGAL_COPY.readCurrent} />
                    </div>
                </>
            ) : null}
        </HudPanel>
    );
}
