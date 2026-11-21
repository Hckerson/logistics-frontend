"use client";
import { useState } from "react";
import { Search } from "@carbon/icons-react";
import LoadBoardFields from "@/components/common/load-board-fields";
import Button from "@/components/ui/button";
import Drawer from "@/components/ui/drawer";
import Panel from "@/components/ui/panel";
import { LOAD_BOARD_COPY } from "@/lib/data/load-board/copy";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { EQUIPMENT_TYPES } from "@/lib/enums/equipment-type";
import { LOAD_BOARD } from "@/lib/load-board/constants";
import type { LoadBoardQuery } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    wide: boolean;
    draft: LoadBoardQuery;
    onDraft: (draft: LoadBoardQuery) => void;
    onApply: () => void;
    onClear: () => void;
}

const { search: copy } = LOAD_BOARD_COPY;

const summaryOf = ({ origin, originRadius, destination, equipment }: LoadBoardQuery) => {
    const kind = EQUIPMENT_TYPES.find((known) => known === equipment);
    return [
        origin ? `${origin} ${fillTemplate(copy.summary.within, { miles: String(originRadius ?? LOAD_BOARD.radius.fallback) })}` : copy.summary.anywhere,
        fillTemplate(copy.summary.to, { place: destination ?? copy.summary.anywhere }),
        kind ? LOAD_COPY.equipment[kind] : copy.summary.any,
    ].join(" · ");
};

export default function LoadBoardSearch({ wide, draft, onDraft, onApply, onClear }: Props) {
    const [open, setOpen] = useState(false);

    if (wide) {
        return (
            <Panel
                label={copy.label}
                aside={
                    <Button tone="link" size="inline" onPress={onClear}>
                        {copy.clear}
                    </Button>
                }
            >
                <LoadBoardFields draft={draft} onDraft={onDraft} />
            </Panel>
        );
    }

    return (
        <div className="border-border-dark flex items-center justify-between gap-3 border px-4 py-3">
            <p className="text-text-secondary min-w-0 text-xs">{summaryOf(draft)}</p>
            <Button tone="outline" icon={Search} onPress={() => setOpen(true)} className="min-h-11 shrink-0">
                {copy.open}
            </Button>
            <Drawer
                isOpen={open}
                onOpenChange={setOpen}
                side="bottom"
                title={copy.label}
                footer={
                    <div className="flex flex-col gap-2">
                        <Button
                            size="wide"
                            className="min-h-12"
                            onPress={() => {
                                onApply();
                                setOpen(false);
                            }}
                        >
                            {copy.apply}
                        </Button>
                        <Button tone="ghost" onPress={onClear}>
                            {copy.clear}
                        </Button>
                    </div>
                }
            >
                <div className="p-4">
                    <LoadBoardFields draft={draft} onDraft={onDraft} />
                </div>
            </Drawer>
        </div>
    );
}
