"use client";
import clsx from "clsx";
import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowDown, ArrowUp, Draggable, TrashCan } from "@carbon/icons-react";
import { useAnnounce } from "@/components/providers/announcer-provider";
import IconButton from "@/components/ui/icon-button";
import { LANE_COPY } from "@/lib/data/loads/post-copy";
import { FOCUS_RING } from "@/lib/ui/constants";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    index: number;
    total: number;
    removable: boolean;
    onMove: (from: number, to: number) => void;
    onRemove: () => void;
}

const position = (index: number, total: number) => ({ position: String(index + 1), total: String(total) });

export default function PostStopControls({ index, total, removable, onMove, onRemove }: Props) {
    const [grabbed, setGrabbed] = useState(false);
    const origin = useRef(index);
    const announce = useAnnounce();
    const label = { index: String(index + 1) };

    const move = (to: number, message: string) => {
        if (to < 0 || to >= total || to === index) return;
        onMove(index, to);
        announce({ message: fillTemplate(message, position(to, total)) });
    };

    const keys = (event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            if (!grabbed) origin.current = index;
            announce({ message: grabbed ? fillTemplate(LANE_COPY.dropped, position(index, total)) : fillTemplate(LANE_COPY.grabbed, label) });
            setGrabbed(!grabbed);
            return;
        }
        if (!grabbed) return;
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();
            move(event.key === "ArrowUp" ? index - 1 : index + 1, LANE_COPY.moved);
        }
        if (event.key === "Escape") {
            event.preventDefault();
            setGrabbed(false);
            if (origin.current !== index) onMove(index, origin.current);
            announce({ message: LANE_COPY.cancelled });
        }
    };

    return (
        <div className="flex items-center gap-0.5">
            <button
                type="button"
                aria-label={fillTemplate(LANE_COPY.grab, label)}
                aria-pressed={grabbed}
                onKeyDown={keys}
                onBlur={() => setGrabbed(false)}
                className={clsx(
                    FOCUS_RING,
                    "grid size-7 cursor-grab place-items-center transition-colors max-sm:hidden",
                    grabbed ? "bg-text text-text-inverse" : "text-text-muted hover:text-text",
                )}
            >
                <Draggable aria-hidden className="size-3.5" />
            </button>
            <IconButton
                label={fillTemplate(LANE_COPY.moveUp, label)}
                icon={ArrowUp}
                tone="ghost"
                size="sm"
                isDisabled={index === 0}
                onPress={() => move(index - 1, LANE_COPY.moved)}
            />
            <IconButton
                label={fillTemplate(LANE_COPY.moveDown, label)}
                icon={ArrowDown}
                tone="ghost"
                size="sm"
                isDisabled={index === total - 1}
                onPress={() => move(index + 1, LANE_COPY.moved)}
            />
            <IconButton
                label={fillTemplate(LANE_COPY.remove, label)}
                icon={TrashCan}
                tone="ghost"
                size="sm"
                disabledReason={removable ? undefined : LANE_COPY.removeMin}
                onPress={onRemove}
            />
        </div>
    );
}
