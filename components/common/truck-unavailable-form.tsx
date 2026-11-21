"use client";
import { nanoid } from "nanoid";
import { useId, useState } from "react";
import { WarningFilled } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import DateRangeField from "@/components/ui/date-range-field";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import { useAnnounce } from "@/components/providers/announcer-provider";
import type { FleetTruckDto, FleetUnavailableDto } from "@/lib/contract/schemas";
import { FLEET_COPY } from "@/lib/data/fleet/copy";
import { FLEET, UNAVAILABLE_REASONS } from "@/lib/fleet/constants";
import { truckName } from "@/lib/fleet/grid";
import { useTruckAvailability } from "@/lib/hooks/use-fleet-plan";
import { stopMoment } from "@/lib/loads/view";
import type { DateRangeValue } from "@/lib/types";
import { errorMessage, failureFrom } from "@/lib/utils/action-result";
import { zoneLabel } from "@/lib/utils/date-value";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    truck: FleetTruckDto;
    timeZone: string;
    onClose: () => void;
}

const { unavailable: copy, reasons } = FLEET_COPY;
const REASON_OPTIONS = UNAVAILABLE_REASONS.map((value) => ({ value, label: reasons[value] }));

export default function TruckUnavailableForm({ truck, timeZone, onClose }: Props) {
    const fieldId = useId();
    const [id] = useState(nanoid);
    const [period, setPeriod] = useState<DateRangeValue | null>(null);
    const [reason, setReason] = useState<FleetUnavailableDto["reason"]>("maintenance");
    const [note, setNote] = useState("");
    const [missing, setMissing] = useState(false);
    const { mark } = useTruckAvailability(truck.id);
    const announce = useAnnounce();
    const failure = mark.isError ? failureFrom(mark.error) : null;
    const problem = failure ? (failure.errorClass === "validation" ? copy.covers : errorMessage(failure)) : null;

    const save = () => {
        if (!period) return setMissing(true);
        mark.mutate(
            { id, from: period.start, to: period.end, reason, note: note.trim() || undefined },
            {
                onSuccess: (saved) => {
                    announce({ message: fillTemplate(copy.saved, { truck: truckName(truck), until: stopMoment(saved.to, timeZone) }) });
                    onClose();
                },
            },
        );
    };

    return (
        <div className="flex flex-col gap-4">
            <Field id={`${fieldId}-period`} label={copy.period} hint={fillTemplate(copy.periodHint, { zone: zoneLabel(timeZone) })} error={missing ? copy.missing : undefined}>
                {(control) => (
                    <DateRangeField
                        {...control}
                        value={period}
                        onChange={(next) => {
                            setPeriod(next);
                            setMissing(false);
                        }}
                        granularity="minute"
                        timeZone={timeZone}
                    />
                )}
            </Field>
            <Field id={`${fieldId}-reason`} label={copy.reason}>
                {(control) => <Select {...control} options={REASON_OPTIONS} value={reason} onChange={setReason} />}
            </Field>
            <Field id={`${fieldId}-note`} label={copy.note} hint={copy.noteHint}>
                {(control) => <Input {...control} value={note} maxLength={FLEET.noteMax} onChange={(event) => setNote(event.target.value)} />}
            </Field>
            {problem ? (
                <p role="alert" className="text-error flex items-start gap-1.5 text-xs">
                    <WarningFilled aria-hidden className="mt-px size-3.5 shrink-0" />
                    {problem}
                </p>
            ) : null}
            <div className="flex flex-wrap justify-end gap-2">
                <Button tone="ghost" isDisabled={mark.isPending} onPress={onClose}>
                    {copy.cancel}
                </Button>
                <Button tone="ink" pending={mark.isPending} pendingLabel={copy.saving} onPress={save}>
                    {copy.save}
                </Button>
            </div>
        </div>
    );
}
