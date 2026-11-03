"use client";
import clsx from "clsx";
import type { ReactNode } from "react";
import { ChevronRight } from "@carbon/icons-react";
import { Button, Disclosure as AriaDisclosure, DisclosurePanel, Heading } from "react-aria-components";

interface Props {
    title: string;
    kicker?: string;
    level?: 2 | 3 | 4;
    defaultExpanded?: boolean;
    className?: string;
    children: ReactNode;
}

export default function Disclosure({ title, kicker, level = 3, defaultExpanded = false, className, children }: Props) {
    return (
        <AriaDisclosure defaultExpanded={defaultExpanded} className={clsx("group/disclosure border-border border-b", className)}>
            <Heading level={level} className="m-0">
                <Button
                    slot="trigger"
                    className="text-text data-focus-visible:outline-text flex w-full cursor-pointer items-center gap-2 py-2.5 text-left text-xs font-medium outline-none data-focus-visible:outline-2"
                >
                    <ChevronRight
                        aria-hidden
                        className="text-text-muted size-4 shrink-0 transition-transform duration-200 group-data-expanded/disclosure:rotate-90"
                    />
                    {kicker ? <span className="haulr-label text-text-muted">{kicker}</span> : null}
                    <span className="min-w-0">{title}</span>
                </Button>
            </Heading>
            <DisclosurePanel className="text-text-secondary pb-3 pl-6 text-xs leading-relaxed">{children}</DisclosurePanel>
        </AriaDisclosure>
    );
}
