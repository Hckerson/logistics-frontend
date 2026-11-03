"use client";
import { Close } from "@carbon/icons-react";
import { Heading } from "react-aria-components";
import IconButton from "@/components/ui/icon-button";
import { LABEL_TEXT, UI_COPY } from "@/lib/ui/constants";

interface Props {
    title: string;
    kicker?: string;
    closable: boolean;
    onClose: () => void;
}

export default function DialogHeader({ title, kicker, closable, onClose }: Props) {
    return (
        <header className="border-border flex shrink-0 items-start justify-between gap-3 border-b py-2.5 pr-2 pl-4">
            <div className="flex min-w-0 flex-col gap-1 pt-1">
                {kicker ? <p className={LABEL_TEXT}>{kicker}</p> : null}
                <Heading slot="title" className="text-text text-sm font-medium">
                    {title}
                </Heading>
            </div>
            <IconButton label={UI_COPY.close} icon={Close} size="sm" isDisabled={!closable} onPress={onClose} />
        </header>
    );
}
