"use client";
import { useId, useState, type ChangeEvent } from "react";
import { WarningFilled } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import Drawer from "@/components/ui/drawer";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import SegmentedControl from "@/components/ui/segmented-control";
import Select from "@/components/ui/select";
import { useAnnounce } from "@/components/providers/announcer-provider";
import type { FleetVehicleDto } from "@/lib/contract/schemas";
import { ROSTER_COPY } from "@/lib/data/fleet/roster-copy";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { EQUIPMENT_TYPES } from "@/lib/enums/equipment-type";
import { ROSTER } from "@/lib/fleet/constants";
import { draftOf, vehicleProblems } from "@/lib/fleet/roster";
import { useFleetRoster, useSaveVehicle } from "@/lib/hooks/use-fleet";
import type { VehicleField } from "@/lib/types";
import { errorMessage, failureFrom } from "@/lib/utils/action-result";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    isOpen: boolean;
    vehicle: FleetVehicleDto | null;
    onClose: () => void;
}

const { editor: copy, kinds } = ROSTER_COPY;
const EQUIPMENT_OPTIONS = EQUIPMENT_TYPES.map((value) => ({ value, label: LOAD_COPY.equipment[value] }));
const NO_DRIVER = "none";
const CAPS = "font-mono uppercase";

export default function FleetVehicleEditor({ isOpen, vehicle, onClose }: Props) {
    const fieldId = useId();
    const [draft, setDraft] = useState(() => draftOf(vehicle));
    const [problems, setProblems] = useState<Partial<Record<VehicleField, string>>>({});
    const save = useSaveVehicle(vehicle?.id ?? null);
    const roster = useFleetRoster();
    const announce = useAnnounce();
    const failure = save.isError ? failureFrom(save.error) : null;
    const problem = failure ? (failure.errorClass === "conflict" ? copy.taken : errorMessage(failure)) : null;
    const drivers = [{ value: NO_DRIVER, label: copy.noDriver }, ...(roster.data?.drivers ?? []).map((driver) => ({ value: driver.id, label: driver.name }))];
    const truck = draft.kind === "truck";

    const text = (field: VehicleField) => (event: ChangeEvent<HTMLInputElement>) => {
        setDraft((current) => ({ ...current, [field]: event.target.value }));
        setProblems((current) => ({ ...current, [field]: undefined }));
        save.reset();
    };

    const submit = () => {
        const found = vehicleProblems(draft);
        if (Object.keys(found).length > 0) return setProblems(found);
        save.mutate(truck ? draft : { ...draft, driverId: null }, {
            onSuccess: (saved) => {
                announce({ message: fillTemplate(vehicle ? copy.saved : copy.added, { unit: saved.unit }) });
                onClose();
            },
        });
    };

    return (
        <Drawer
            isOpen={isOpen}
            onOpenChange={(open) => (open ? undefined : onClose())}
            title={vehicle ? fillTemplate(copy.edit, { unit: vehicle.unit }) : copy.add}
            kicker={copy.kicker}
            side="right"
            width="md"
            footer={
                <div className="flex flex-wrap justify-end gap-2">
                    <Button tone="ghost" isDisabled={save.isPending} onPress={onClose}>
                        {copy.cancel}
                    </Button>
                    <Button tone="ink" pending={save.isPending} pendingLabel={copy.saving} onPress={submit}>
                        {copy.save}
                    </Button>
                </div>
            }
        >
            <div className="flex flex-col gap-4">
                {vehicle ? null : <SegmentedControl label={copy.kind} options={kinds} value={draft.kind} onChange={(kind) => setDraft((current) => ({ ...current, kind }))} />}
                <Field id={`${fieldId}-unit`} label={copy.unit} hint={copy.unitHint} error={problems.unit}>
                    {(control) => <Input {...control} value={draft.unit} maxLength={ROSTER.unitMax} autoComplete="off" onChange={text("unit")} />}
                </Field>
                <Field id={`${fieldId}-equipment`} label={copy.equipment}>
                    {(control) => <Select {...control} options={EQUIPMENT_OPTIONS} value={draft.equipment} onChange={(equipment) => setDraft((current) => ({ ...current, equipment }))} />}
                </Field>
                <Field id={`${fieldId}-vin`} label={copy.vin} hint={copy.vinHint} error={problems.vin}>
                    {(control) => <Input {...control} className={CAPS} value={draft.vin} maxLength={ROSTER.vinLength} autoComplete="off" spellCheck={false} onChange={text("vin")} />}
                </Field>
                <div className="grid grid-cols-[1fr_6rem] items-start gap-3">
                    <Field id={`${fieldId}-plate`} label={copy.plate} error={problems.plate}>
                        {(control) => <Input {...control} className={CAPS} value={draft.plate} maxLength={ROSTER.plateMax} autoComplete="off" spellCheck={false} onChange={text("plate")} />}
                    </Field>
                    <Field id={`${fieldId}-state`} label={copy.plateState} error={problems.plateState}>
                        {(control) => <Input {...control} className={CAPS} value={draft.plateState} maxLength={ROSTER.stateLength} autoComplete="off" onChange={text("plateState")} />}
                    </Field>
                </div>
                {truck ? (
                    <Field id={`${fieldId}-driver`} label={copy.driver} hint={copy.driverHint}>
                        {(control) => (
                            <Select
                                {...control}
                                options={drivers}
                                value={draft.driverId ?? NO_DRIVER}
                                onChange={(driverId) => setDraft((current) => ({ ...current, driverId: driverId === NO_DRIVER ? null : driverId }))}
                            />
                        )}
                    </Field>
                ) : null}
                {problem ? (
                    <p role="alert" className="text-error flex items-start gap-1.5 text-xs">
                        <WarningFilled aria-hidden className="mt-px size-3.5 shrink-0" />
                        {problem}
                    </p>
                ) : null}
            </div>
        </Drawer>
    );
}
