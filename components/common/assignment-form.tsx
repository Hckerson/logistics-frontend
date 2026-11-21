"use client";
import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import AssignmentDeadline from "@/components/common/assignment-deadline";
import AssignmentInvite from "@/components/common/assignment-invite";
import Button from "@/components/ui/button";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import RadioGroup from "@/components/ui/radio-group";
import { useAnnounce } from "@/components/providers/announcer-provider";
import Select from "@/components/ui/select";
import { appRoutes } from "@/lib/app-routes";
import { QUIET_LINK } from "@/lib/auth/constants";
import type { AssignLoadDto, FleetOptionDto, FleetOptionsDto } from "@/lib/contract/schemas";
import { ASSIGNMENT_COPY } from "@/lib/data/fleet/assignment";
import { FLEET } from "@/lib/fleet/constants";
import type { AssignTarget } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    options: FleetOptionsDto;
    target: AssignTarget;
    staff: boolean;
    pending: boolean;
    preview?: ReactNode;
    onSubmit: (input: AssignLoadDto, names: { driver: string; truck: string }) => void;
    onCancel: () => void;
}

const copy = ASSIGNMENT_COPY;

const choices = (options: readonly FleetOptionDto[], detail: (option: FleetOptionDto) => string | undefined) =>
    options.map((option) => ({ value: option.id, label: option.label, detail: detail(option), disabledReason: option.eligible ? undefined : (option.reason ?? undefined) }));

const eligible = (options: readonly FleetOptionDto[], ...ids: (string | null | undefined)[]) =>
    ids.find((id) => options.some((option) => option.id === id && option.eligible)) ?? null;

export default function AssignmentForm({ options, target, staff, pending, preview, onSubmit, onCancel }: Props) {
    const fieldId = useId();
    const [driverId, setDriverId] = useState(() => eligible(options.drivers, target.driverId, options.driverId));
    const [truckId, setTruckId] = useState(() => eligible(options.trucks, target.truckId, options.truckId));
    const [source, setSource] = useState<AssignLoadDto["trackingSource"]>("driverApp");
    const [reason, setReason] = useState("");
    const [checked, setChecked] = useState(false);
    const needsReason = options.reassign || staff;
    const driver = options.drivers.find(({ id }) => id === driverId);
    const truck = options.trucks.find(({ id }) => id === truckId);
    const current = options.drivers.find(({ id }) => id === options.driverId);
    const missing = { driver: !driver, truck: !truck, reason: needsReason && !reason.trim() };
    const announce = useAnnounce();
    const pairDriver = options.drivers.find((option) => option.id === options.suggestion?.driverId);
    const pairTruck = options.trucks.find((option) => option.id === options.suggestion?.truckId);
    const offer =
        options.suggestion && pairDriver && pairTruck && (pairDriver.id !== driverId || pairTruck.id !== truckId)
            ? { load: options.suggestion.loadId, driver: pairDriver, truck: pairTruck }
            : null;

    const takePair = (pair: NonNullable<typeof offer>) => {
        setDriverId(pair.driver.id);
        setTruckId(pair.truck.id);
        announce({ message: fillTemplate(copy.suggestion.used, { driver: pair.driver.label, truck: pair.truck.label }) });
    };

    const pickDriver = (id: string) => {
        setDriverId(id);
        const chosen = options.drivers.find((option) => option.id === id);
        if (!truckId && chosen) setTruckId(options.trucks.find((option) => option.eligible && option.detail === chosen.label)?.id ?? null);
    };

    const submit = () => {
        setChecked(true);
        if (!driver || !truck || missing.reason) return;
        onSubmit({ driverId: driver.id, truckId: truck.id, trackingSource: source, version: options.version, reason: reason.trim() || undefined }, { driver: driver.label, truck: truck.label });
    };

    return (
        <div className="flex flex-col gap-4">
            {options.deadline ? <AssignmentDeadline deadline={options.deadline} timeZone={options.timeZone} /> : null}
            {options.drivers.length === 0 ? <p className="text-text-secondary text-xs">{copy.noDrivers}</p> : null}
            {offer ? (
                <div className="border-border flex flex-wrap items-center justify-between gap-2 border px-3 py-2 text-xs">
                    <span className="text-text-secondary">{fillTemplate(copy.suggestion.label, { driver: offer.driver.label, truck: offer.truck.label, load: offer.load })}</span>
                    <Button tone="outline" size="sm" onPress={() => takePair(offer)}>
                        {copy.suggestion.use}
                    </Button>
                </div>
            ) : null}
            <Field id={`${fieldId}-driver`} label={copy.driver} error={checked && missing.driver ? copy.missing.driver : undefined}>
                {(control) => <Select {...control} options={choices(options.drivers, () => undefined)} value={driverId} onChange={pickDriver} placeholder={copy.driverPlaceholder} />}
            </Field>
            <AssignmentInvite timeZone={options.timeZone} />
            <Field
                id={`${fieldId}-truck`}
                label={copy.truck}
                error={checked && missing.truck ? copy.missing.truck : undefined}
                hint={options.trucks.some(({ eligible: fits }) => fits) ? undefined : <Link href={appRoutes.fleet()} className={QUIET_LINK}>{`${copy.noTrucks} ${copy.addTruck}`}</Link>}
            >
                {(control) => (
                    <Select
                        {...control}
                        options={choices(options.trucks, ({ detail }) => (detail ? fillTemplate(copy.usual, { driver: detail }) : undefined))}
                        value={truckId}
                        onChange={setTruckId}
                        placeholder={copy.truckPlaceholder}
                    />
                )}
            </Field>
            <RadioGroup legend={copy.tracking} options={copy.sources} value={source} onChange={setSource} columns={2} />
            {preview}
            {needsReason ? (
                <Field id={`${fieldId}-reason`} label={staff ? copy.reasonStaff : copy.reason} hint={copy.reasonHint} error={checked && missing.reason ? copy.missing.reason : undefined}>
                    {(control) => <Input {...control} value={reason} maxLength={FLEET.reasonMax} onChange={(event) => setReason(event.target.value)} />}
                </Field>
            ) : null}
            {options.reassign && current && current.id !== driverId ? <p className="text-text-secondary text-xs">{fillTemplate(copy.loses, { driver: current.label })}</p> : null}
            <div className="flex flex-wrap justify-end gap-2">
                <Button tone="ghost" isDisabled={pending} onPress={onCancel}>
                    {copy.cancel}
                </Button>
                <Button tone="ink" pending={pending} pendingLabel={copy.assigning} onPress={submit}>
                    {options.reassign ? copy.reassign : copy.confirm}
                </Button>
            </div>
        </div>
    );
}
