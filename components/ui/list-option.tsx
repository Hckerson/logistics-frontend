"use client";
import { Checkmark } from "@carbon/icons-react";
import { ListBoxItem } from "react-aria-components";
import { ITEM_ROW, ITEM_SIGNAL } from "@/lib/ui/constants";

interface Props {
    id: string;
    label: string;
    detail?: string;
    disabledReason?: string;
}

export default function ListOption({ id, label, detail, disabledReason }: Props) {
    const note = disabledReason ?? detail;

    return (
        <ListBoxItem id={id} textValue={label} isDisabled={disabledReason !== undefined} className={ITEM_ROW}>
            {({ isSelected }) => (
                <>
                    <span aria-hidden className={ITEM_SIGNAL} />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span>{label}</span>
                        {note ? <span className="text-text-muted">{note}</span> : null}
                    </span>
                    {isSelected ? <Checkmark aria-hidden className="text-accent size-4 shrink-0" /> : null}
                </>
            )}
        </ListBoxItem>
    );
}
