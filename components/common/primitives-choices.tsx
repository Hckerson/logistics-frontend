"use client";
import { useState } from "react";
import PrimitivesSection from "@/components/common/primitives-section";
import PrimitivesSpecimen from "@/components/common/primitives-specimen";
import Checkbox from "@/components/ui/checkbox";
import RadioGroup from "@/components/ui/radio-group";
import SegmentedControl from "@/components/ui/segmented-control";
import Switch from "@/components/ui/switch";
import Tabs from "@/components/ui/tabs";
import { PRIMITIVES_COPY } from "@/lib/data/primitives/copy";
import { SPECIMEN_PENDING_MS, SPECIMEN_PERIODS, SPECIMEN_REASONS, SPECIMEN_TAB_BODY, SPECIMEN_TABS } from "@/lib/data/primitives/samples";

const { sections, specimens, demo } = PRIMITIVES_COPY;

export default function PrimitivesChoices() {
    const [notify, setNotify] = useState(true);
    const [reason, setReason] = useState<string | null>(null);
    const [period, setPeriod] = useState(SPECIMEN_PERIODS[1].value);
    const [live, setLive] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tab, setTab] = useState(SPECIMEN_TABS[0].id);

    const toggleLive = (next: boolean) => {
        setLive(next);
        setSaving(true);
        setTimeout(() => setSaving(false), SPECIMEN_PENDING_MS);
    };

    return (
        <PrimitivesSection {...sections.choices}>
            <PrimitivesSpecimen label={specimens.checkbox} contract="IC-38">
                <Checkbox isSelected={notify} onChange={setNotify}>
                    {demo.consent}
                </Checkbox>
                <Checkbox isIndeterminate>{demo.alerts}</Checkbox>
            </PrimitivesSpecimen>
            <PrimitivesSpecimen label={specimens.switches} contract="IC-36">
                <div className="flex w-full flex-col gap-3">
                    <Switch label={demo.live} isSelected={live} onChange={toggleLive} pending={saving} />
                    <Switch label={demo.alerts} isSelected={false} onChange={setNotify} lockedReason={demo.alertsLocked} />
                </div>
            </PrimitivesSpecimen>
            <PrimitivesSpecimen label={specimens.segmented} contract="IC-17">
                <SegmentedControl label={demo.period} options={SPECIMEN_PERIODS} value={period} onChange={setPeriod} />
            </PrimitivesSpecimen>
            <PrimitivesSpecimen label={specimens.radio} contract="IC-09">
                <RadioGroup
                    id="specimen-reason"
                    name="reason"
                    legend={demo.reason}
                    options={SPECIMEN_REASONS}
                    value={reason}
                    onChange={setReason}
                    className="w-full"
                />
            </PrimitivesSpecimen>
            <PrimitivesSpecimen label={specimens.tabs} contract="IC-16" wide>
                <Tabs tabs={SPECIMEN_TABS} selected={tab} onSelect={setTab} label={demo.tabsLabel} className="w-full">
                    {(id) => <p className="text-text-secondary py-3 text-xs">{SPECIMEN_TAB_BODY[id]}</p>}
                </Tabs>
            </PrimitivesSpecimen>
        </PrimitivesSection>
    );
}
