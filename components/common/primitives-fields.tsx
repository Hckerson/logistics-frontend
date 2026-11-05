"use client";
import { useState } from "react";
import { Location, Search } from "@carbon/icons-react";
import PrimitivesSection from "@/components/common/primitives-section";
import PrimitivesSpecimen from "@/components/common/primitives-specimen";
import Combobox from "@/components/ui/combobox";
import DateField from "@/components/ui/date-field";
import DateRangeField from "@/components/ui/date-range-field";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import Kbd from "@/components/ui/kbd";
import SearchField from "@/components/ui/search-field";
import Select from "@/components/ui/select";
import { REPORT_RANGE_DAYS } from "@/lib/constants";
import { PRIMITIVES_COPY } from "@/lib/data/primitives/copy";
import {
    SPECIMEN_CITIES,
    SPECIMEN_EQUIPMENT,
    SPECIMEN_LOADS,
    SPECIMEN_PERIOD,
    SPECIMEN_SHORTCUT,
    SPECIMEN_TIME_ZONE,
    SPECIMEN_WINDOW,
} from "@/lib/data/primitives/samples";
import { MINUTE_STEP } from "@/lib/ui/constants";
import { fillTemplate } from "@/lib/utils/fill-template";
import type { DateRangeValue } from "@/lib/types";

const { sections, specimens, demo } = PRIMITIVES_COPY;

const stepHint = fillTemplate(demo.stepHint, { step: String(MINUTE_STEP) });

export default function PrimitivesFields() {
    const [reference, setReference] = useState("");
    const [query, setQuery] = useState("");
    const [equipment, setEquipment] = useState<string | null>(SPECIMEN_EQUIPMENT[0].value);
    const [origin, setOrigin] = useState<string | null>(null);
    const [touched, setTouched] = useState(false);
    const [pickup, setPickup] = useState<string | null>(null);
    const [period, setPeriod] = useState<DateRangeValue | null>(SPECIMEN_PERIOD);
    const [appointment, setAppointment] = useState<DateRangeValue | null>(SPECIMEN_WINDOW);
    const error = touched && reference.trim() === "" ? demo.referenceError : undefined;

    return (
        <PrimitivesSection {...sections.fields}>
            <PrimitivesSpecimen label={specimens.input} contract="IC-01 · IC-02">
                <div className="w-full">
                    <Field id="specimen-reference" label={demo.reference} hint={demo.referenceHint} error={error}>
                        {(control) => (
                            <Input {...control} value={reference} onChange={(event) => setReference(event.target.value)} onBlur={() => setTouched(true)} />
                        )}
                    </Field>
                </div>
            </PrimitivesSpecimen>
            <PrimitivesSpecimen label={specimens.units} contract="IC-01">
                <div className="grid w-full grid-cols-2 gap-2">
                    <Field id="specimen-weight" label={demo.weight}>
                        {(control) => <Input {...control} inputMode="decimal" defaultValue="42,000" unit={demo.weightUnit} />}
                    </Field>
                    <Field id="specimen-rate" label={demo.rate}>
                        {(control) => <Input {...control} inputMode="decimal" defaultValue="2,140.00" unit={demo.rateUnit} />}
                    </Field>
                </div>
            </PrimitivesSpecimen>
            <PrimitivesSpecimen label={specimens.invalid} contract="IC-01">
                <div className="w-full">
                    <Field id="specimen-load" label={demo.readOnly}>
                        {(control) => <Input {...control} readOnly value={SPECIMEN_LOADS[0].reference} className="font-mono" />}
                    </Field>
                </div>
            </PrimitivesSpecimen>
            <PrimitivesSpecimen label={specimens.search} contract="IC-19 · IC-50">
                <SearchField label={demo.searchLabel} value={query} onChange={setQuery} placeholder={demo.searchPlaceholder} shortcut={SPECIMEN_SHORTCUT} />
            </PrimitivesSpecimen>
            <PrimitivesSpecimen label={specimens.select} contract="IC-07">
                <div className="w-full">
                    <Field id="specimen-equipment" label={demo.equipment}>
                        {(control) => <Select {...control} options={SPECIMEN_EQUIPMENT} value={equipment} onChange={setEquipment} />}
                    </Field>
                </div>
            </PrimitivesSpecimen>
            <PrimitivesSpecimen label={specimens.combobox} contract="IC-05">
                <div className="w-full">
                    <Field id="specimen-origin" label={demo.origin}>
                        {(control) => (
                            <Combobox
                                {...control}
                                icon={Location}
                                options={SPECIMEN_CITIES}
                                value={origin}
                                onChange={setOrigin}
                                placeholder={demo.originPlaceholder}
                            />
                        )}
                    </Field>
                </div>
            </PrimitivesSpecimen>
            <PrimitivesSpecimen label={specimens.date} contract="IC-08">
                <div className="w-full">
                    <Field id="specimen-pickup" label={demo.pickupDate} hint={stepHint}>
                        {(control) => <DateField {...control} value={pickup} onChange={setPickup} timeZone={SPECIMEN_TIME_ZONE} granularity="minute" />}
                    </Field>
                </div>
            </PrimitivesSpecimen>
            <PrimitivesSpecimen label={specimens.range} contract="IC-08 · IC-17">
                <div className="w-full">
                    <Field id="specimen-period" label={demo.reportRange} hint={fillTemplate(demo.rangeHint, { days: String(REPORT_RANGE_DAYS) })}>
                        {(control) => <DateRangeField {...control} value={period} onChange={setPeriod} maxDays={REPORT_RANGE_DAYS} />}
                    </Field>
                </div>
            </PrimitivesSpecimen>
            <PrimitivesSpecimen label={specimens.window} contract="IC-08" wide>
                <div className="w-full max-w-md">
                    <Field id="specimen-window" label={demo.deliveryWindow} hint={stepHint}>
                        {(control) => (
                            <DateRangeField {...control} value={appointment} onChange={setAppointment} timeZone={SPECIMEN_TIME_ZONE} granularity="minute" />
                        )}
                    </Field>
                </div>
            </PrimitivesSpecimen>
            <PrimitivesSpecimen label={specimens.editorial} wide>
                <div className="grid w-full gap-2 md:grid-cols-[1fr_auto]">
                    <Input size="xl" icon={Search} aria-label={demo.searchLabel} placeholder={demo.searchPlaceholder} />
                    <span className="flex items-center gap-2">
                        <span className="haulr-label text-text-muted">{demo.quickFind}</span>
                        <Kbd keys={SPECIMEN_SHORTCUT} />
                    </span>
                </div>
            </PrimitivesSpecimen>
        </PrimitivesSection>
    );
}
