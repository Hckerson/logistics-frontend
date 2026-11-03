"use client";
import { ChevronDown, OverflowMenuVertical } from "@carbon/icons-react";
import { Menu as AriaMenu, MenuTrigger, type Key } from "react-aria-components";
import Button from "@/components/ui/button";
import IconButton from "@/components/ui/icon-button";
import MenuItem from "@/components/ui/menu-item";
import Popover from "@/components/ui/popover";
import type { ButtonTone, ControlSize, MenuEntry } from "@/lib/types";

interface Props {
    label: string;
    items: readonly MenuEntry[];
    onAction: (id: string) => void;
    text?: string;
    tone?: ButtonTone;
    size?: ControlSize;
    pending?: boolean;
    placement?: "bottom start" | "bottom end";
}

export default function Menu({ label, items, onAction, text, tone, size = "md", pending = false, placement = "bottom end" }: Props) {
    const act = (key: Key) => {
        const entry = items.find((item) => item.id === key);
        if (entry && !entry.href) onAction(entry.id);
    };

    return (
        <MenuTrigger>
            {text ? (
                <Button tone={tone ?? "outline"} size={size} pending={pending} trailing={ChevronDown}>
                    {text}
                </Button>
            ) : (
                <IconButton label={label} icon={OverflowMenuVertical} tone={tone} size={size} pending={pending} />
            )}
            <Popover placement={placement} className="min-w-48">
                <AriaMenu aria-label={label} onAction={act} className="max-h-80 overflow-y-auto py-1 outline-none">
                    {items.map((entry) => (
                        <MenuItem key={entry.id} entry={entry} />
                    ))}
                </AriaMenu>
            </Popover>
        </MenuTrigger>
    );
}
