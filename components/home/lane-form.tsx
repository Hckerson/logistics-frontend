"use client";
import { useId, type ChangeEvent } from "react";
import { ArrowRight } from "@carbon/icons-react";
import FormLane from "@/components/home/form-lane";
import { haulrButtonClass } from "@/components/home/haulr-button";
import LaneField from "@/components/home/lane-field";
import { CLOSE_COPY } from "@/lib/data/home/close";
import { HUBS } from "@/lib/data/home/hubs";
import { RATE_ESTIMATOR_ROUTE } from "@/lib/constants";
import type { LaneDraft } from "@/lib/types";

interface Props {
    lane: LaneDraft;
    onChange: (lane: LaneDraft) => void;
}

const { fields, equipment, listId } = CLOSE_COPY;

export default function LaneForm({ lane, onChange }: Props) {
    const baseId = useId();

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
            <div className="flex flex-col gap-2">
                <label htmlFor={`${baseId}-equipment`} className="haulr-label text-text-muted">
                    {fields.equipment.label}
                </label>
                <select
                    id={`${baseId}-equipment`}
                    name={fields.equipment.name}
                    className="border-border-dark bg-background text-text focus:border-text h-14 rounded-sm border px-4 text-lg focus:outline-none"
                >
                    {equipment.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
            <button type="submit" className={haulrButtonClass("accent", "lg", "cursor-pointer")}>
                {CLOSE_COPY.submit}
                <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <datalist id={listId}>
                {HUBS.map((hub) => (
                    <option key={hub.code} value={hub.name} />
                ))}
            </datalist>
        </form>
    );
}
