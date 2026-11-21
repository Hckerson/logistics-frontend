"use client";
import { useId, useState, type ChangeEvent } from "react";
import { ArrowRight } from "@carbon/icons-react";
import FormLane from "@/components/home/form-lane";
import LaneField from "@/components/home/lane-field";
import Button from "@/components/ui/button";
import RadioGroup from "@/components/ui/radio-group";
import { CLOSE_COPY } from "@/lib/data/home/close";
import { HUBS } from "@/lib/data/home/hubs";
import { RATE_ESTIMATOR_ROUTE } from "@/lib/constants";
import type { LaneDraft } from "@/lib/types";

interface Props {
    lane: LaneDraft;
    onChange: (lane: LaneDraft) => void;
}

const { fields, equipment, listId } = CLOSE_COPY;

type Equipment = (typeof equipment)[number]["value"];

export default function LaneForm({ lane, onChange }: Props) {
    const baseId = useId();
    const [kind, setKind] = useState<Equipment>(equipment[0].value);

    const update = (end: keyof LaneDraft) => (event: ChangeEvent<HTMLInputElement>) =>
        onChange({ ...lane, [end]: event.target.value });

    return (
        <form action={RATE_ESTIMATOR_ROUTE} method="get" className="flex flex-col gap-6">
            <LaneField
                id={`${baseId}-origin`}
                {...fields.origin}
                list={listId}
                value={lane.origin}
                onChange={update("origin")}
            />
            <LaneField
                id={`${baseId}-destination`}
                {...fields.destination}
                list={listId}
                value={lane.destination}
                onChange={update("destination")}
            />
            <FormLane origin={lane.origin.trim() !== ""} destination={lane.destination.trim() !== ""} />
            <RadioGroup
                id={`${baseId}-equipment`}
                name={fields.equipment.name}
                legend={fields.equipment.label}
                options={equipment}
                value={kind}
                columns={3}
                onChange={setKind}
            />
            <Button type="submit" tone="accent" size="lg" trailing={ArrowRight}>
                {CLOSE_COPY.submit}
            </Button>
            <datalist id={listId}>
                {HUBS.map((hub) => (
                    <option key={hub.code} value={hub.name} />
                ))}
            </datalist>
        </form>
    );
}
