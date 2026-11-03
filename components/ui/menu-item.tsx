"use client";
import clsx from "clsx";
import { MenuItem as AriaMenuItem } from "react-aria-components";
import { ITEM_ROW, ITEM_SIGNAL } from "@/lib/ui/constants";
import type { MenuEntry } from "@/lib/types";

interface Props {
    entry: MenuEntry;
}

export default function MenuItem({ entry }: Props) {
    const { id, label, icon: Icon, href, destructive = false, disabledReason } = entry;

    return (
        <AriaMenuItem
            id={id}
            href={href}
            textValue={label}
            isDisabled={disabledReason !== undefined}
            className={clsx(ITEM_ROW, destructive && "text-error!")}
        >
            <span aria-hidden className={ITEM_SIGNAL} />
            {Icon ? <Icon aria-hidden className="size-4 shrink-0" /> : null}
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span>{label}</span>
                {disabledReason ? <span className="text-text-muted">{disabledReason}</span> : null}
            </span>
        </AriaMenuItem>
    );
}
