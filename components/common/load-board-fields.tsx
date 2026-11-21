"use client";
import { useId } from "react";
import LocationField from "@/components/common/location-field";
import RadiusField from "@/components/common/radius-field";
import DateRangeField from "@/components/ui/date-range-field";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import { LOAD_BOARD_COPY } from "@/lib/data/load-board/copy";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { EQUIPMENT_TYPES } from "@/lib/enums/equipment-type";
import { ALL_OPTION } from "@/lib/fleet/constants";
import { LOAD_BOARD } from "@/lib/load-board/constants";
import type { LoadBoardQuery } from "@/lib/types";

interface Props {
    draft: LoadBoardQuery;
    onDraft: (draft: LoadBoardQuery) => void;
}

const { search: copy } = LOAD_BOARD_COPY;
const DAY = 10;

const amount = (value: string) => (value.trim() === "" || Number.isNaN(Number(value)) ? undefined : Number(value));
const text = (value: string) => (value.trim() === "" ? undefined : value);

export default function LoadBoardFields({ draft, onDraft }: Props) {
    const id = useId();
    const set = (patch: Partial<LoadBoardQuery>) => onDraft({ ...draft, ...patch });
    const period = draft.from && draft.to ? { start: draft.from.slice(0, DAY), end: draft.to.slice(0, DAY) } : null;

    return (
        <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="flex flex-col gap-2">
                <LocationField id={`${id}-origin`} label={copy.origin} placeholder={copy.placePlaceholder} value={draft.origin ?? ""} places={copy.places} onChange={(value) => set({ origin: text(value) })} />
                <RadiusField id={`${id}-origin-radius`} label={copy.radius} value={draft.originRadius ?? LOAD_BOARD.radius.fallback} isDisabled={!draft.origin} onChange={(miles) => set({ originRadius: miles })} />
            </div>
            <div className="flex flex-col gap-2">
                <LocationField id={`${id}-destination`} label={copy.destination} placeholder={copy.anywhere} value={draft.destination ?? ""} places={copy.places} onChange={(value) => set({ destination: text(value) })} />
                <RadiusField id={`${id}-destination-radius`} label={copy.radius} value={draft.destinationRadius ?? LOAD_BOARD.radius.fallback} isDisabled={!draft.destination} onChange={(miles) => set({ destinationRadius: miles })} />
            </div>
            <div className="flex flex-col gap-4">
                <Field id={`${id}-dates`} label={copy.dates}>
                    {(control) => <DateRangeField {...control} value={period} onChange={(next) => set({ from: next?.start, to: next?.end })} />}
                </Field>
                <Field id={`${id}-equipment`} label={copy.equipment}>
                    {(control) => (
                        <Select
                            {...control}
                            options={[{ value: ALL_OPTION, label: copy.anyEquipment }, ...EQUIPMENT_TYPES.map((value) => ({ value, label: LOAD_COPY.equipment[value] }))]}
                            value={draft.equipment ?? ALL_OPTION}
                            onChange={(value) => set({ equipment: value === ALL_OPTION ? undefined : value })}
                        />
                    )}
                </Field>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:col-span-2 xl:col-span-1 xl:grid-cols-1">
                <Field id={`${id}-min-rate`} label={copy.minRate}>
                    {(control) => <Input {...control} inputMode="decimal" value={draft.minRate === undefined ? "" : String(draft.minRate)} onChange={(event) => set({ minRate: amount(event.target.value) })} />}
                </Field>
                <Field id={`${id}-min-rpm`} label={copy.minRpm}>
                    {(control) => <Input {...control} inputMode="decimal" value={draft.minRpm === undefined ? "" : String(draft.minRpm)} onChange={(event) => set({ minRpm: amount(event.target.value) })} />}
                </Field>
                <Field id={`${id}-max-weight`} label={copy.maxWeight}>
                    {(control) => <Input {...control} inputMode="numeric" value={draft.maxWeight === undefined ? "" : String(draft.maxWeight)} onChange={(event) => set({ maxWeight: amount(event.target.value) })} />}
                </Field>
            </div>
        </div>
    );
}
