"use client";
import clsx from "clsx";
import { useRef, useState } from "react";
import { Information } from "@carbon/icons-react";
import { Button as AriaButton } from "react-aria-components";
import Popover from "@/components/ui/popover";
import { FOCUS_RING } from "@/lib/ui/constants";
import { UI_COPY } from "@/lib/ui/copy";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    term: string;
    definition: string;
}

const ESCAPE = "Escape";

export default function Toggletip({ term, definition }: Props) {
    const [open, setOpen] = useState(false);
    const trigger = useRef<HTMLButtonElement>(null);

    return (
        <>
            <AriaButton
                ref={trigger}
                aria-label={fillTemplate(UI_COPY.explain, { term })}
                aria-expanded={open}
                onPress={() => setOpen((current) => !current)}
                onBlur={() => setOpen(false)}
                onKeyDown={(event) => {
                    if (event.key === ESCAPE && open) setOpen(false);
                    else event.continuePropagation();
                }}
                className={clsx(
                    "text-text-muted hover:text-accent aria-expanded:text-accent inline-grid size-6 cursor-pointer place-items-center align-middle transition-colors",
                    FOCUS_RING,
                )}
            >
                <Information aria-hidden className="size-3.5" />
            </AriaButton>
            <span role="status" className="sr-only">
                {open ? definition : ""}
            </span>
            <Popover triggerRef={trigger} isOpen={open} onOpenChange={setOpen} isNonModal placement="top start" className="max-w-64">
                <p aria-hidden className="text-text px-3 py-2 text-xs leading-relaxed">
                    {definition}
                </p>
            </Popover>
        </>
    );
}
