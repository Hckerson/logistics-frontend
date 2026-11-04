"use client";
import clsx from "clsx";
import { useId, type ReactNode } from "react";
import { SelectionIndicator, Tab, TabList, TabPanel, Tabs as AriaTabs, type Key } from "react-aria-components";
import { grouped } from "@/lib/utils/format-number";
import { UI_COPY } from "@/lib/ui/copy";
import { fillTemplate } from "@/lib/utils/fill-template";
import type { TabItem } from "@/lib/types";

interface Props {
    tabs: readonly TabItem[];
    selected: string;
    onSelect: (id: string) => void;
    label: string;
    manual?: boolean;
    className?: string;
    children: (id: string) => ReactNode;
}

const TAB = [
    "text-text-muted relative flex h-9 shrink-0 cursor-pointer items-center gap-2 px-3 text-xs outline-none transition-colors",
    "hover:text-text data-selected:text-text data-disabled:cursor-not-allowed data-disabled:opacity-40",
    "data-focus-visible:outline-text data-focus-visible:outline-2 data-focus-visible:-outline-offset-2",
].join(" ");

const INDICATOR =
    "bg-accent absolute -bottom-px left-0 h-0.5 w-full transition-[translate,width] duration-300 ease-(--haulr-ease) motion-reduce:transition-none";

export default function Tabs({ tabs, selected, onSelect, label, manual = false, className, children }: Props) {
    const baseId = useId();
    const reasonId = (id: string) => `${baseId}-${id}-reason`;

    const select = (key: Key) => {
        const tab = tabs.find((item) => item.id === key);
        if (tab) onSelect(tab.id);
    };

    return (
        <>
            <AriaTabs
                selectedKey={selected}
                onSelectionChange={select}
                keyboardActivation={manual ? "manual" : "automatic"}
                className={clsx("flex min-w-0 flex-col", className)}
            >
                <TabList aria-label={label} className="border-border flex overflow-x-auto border-b">
                    {tabs.map((tab) => (
                        <Tab
                            key={tab.id}
                            id={tab.id}
                            isDisabled={tab.disabledReason !== undefined}
                            aria-label={
                                tab.count === undefined ? undefined : fillTemplate(UI_COPY.tabCount, { label: tab.label, count: grouped(tab.count) })
                            }
                            aria-describedby={tab.disabledReason === undefined ? undefined : reasonId(tab.id)}
                            className={TAB}
                        >
                            <span>{tab.label}</span>
                            {tab.count === undefined ? null : (
                                <span aria-hidden className="text-text-muted font-mono tabular-nums">
                                    {grouped(tab.count)}
                                </span>
                            )}
                            <SelectionIndicator className={INDICATOR} />
                        </Tab>
                    ))}
                </TabList>
                {tabs.map((tab) => (
                    <TabPanel key={tab.id} id={tab.id} className="data-focus-visible:outline-text pt-3 outline-none data-focus-visible:outline-2">
                        {() => children(tab.id)}
                    </TabPanel>
                ))}
            </AriaTabs>
            {tabs.map((tab) =>
                tab.disabledReason === undefined ? null : (
                    <span key={tab.id} id={reasonId(tab.id)} hidden>
                        {tab.disabledReason}
                    </span>
                ),
            )}
        </>
    );
}
