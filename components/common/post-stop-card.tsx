"use client";
import { useId } from "react";
import { useStore } from "@tanstack/react-form";
import PostStopControls from "@/components/common/post-stop-controls";
import Combobox from "@/components/ui/combobox";
import DateRangeField from "@/components/ui/date-range-field";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import SegmentedControl from "@/components/ui/segmented-control";
import type { FacilityOptionDto } from "@/lib/contract/schemas";
import { LANE_COPY } from "@/lib/data/loads/post-copy";
import { withForm } from "@/lib/hooks/use-app-form";
import { laneFormOptions } from "@/lib/loads/post-forms";
import { codeOf, stopFieldId, stopMessage } from "@/lib/loads/post-problems";
import { POSTING } from "@/lib/loads/posting";
import { MINUTE_STEP } from "@/lib/ui/constants";
import { bookingBounds, zoneLabel } from "@/lib/utils/date-value";
import { fillTemplate } from "@/lib/utils/fill-template";
import type { ChoiceOption, StopType } from "@/lib/types";

const NO_FACILITIES: readonly FacilityOptionDto[] = [];
const NO_MOVE: (from: number, to: number) => void = () => undefined;
const NO_REMOVE: (index: number) => void = () => undefined;
const TYPES: readonly ChoiceOption<StopType>[] = [
    { value: "pickup", label: LANE_COPY.types.pickup },
    { value: "delivery", label: LANE_COPY.types.delivery },
];

interface Meta {
    errors: readonly unknown[];
    isBlurred: boolean;
    isDirty: boolean;
}

const shown = (meta: Meta, attempted: boolean) => (attempted || meta.isBlurred || meta.isDirty ? codeOf(meta.errors) : null);

const PostStopCard = withForm({
    ...laneFormOptions,
    props: { index: 0, total: 0, facilities: NO_FACILITIES, onMove: NO_MOVE, onRemove: NO_REMOVE },
    render: function Render({ form, index, total, facilities, onMove, onRemove }) {
        const labelId = useId();
        const stop = useStore(form.store, (state) => state.values.stops[index]);
        const attempted = useStore(form.store, (state) => state.submissionAttempts > 0);
        const facility = facilities.find((candidate) => candidate.id === stop?.facilityId) ?? null;
        const options = facilities.map((option) => ({ value: option.id, label: option.name, detail: `${option.line1}, ${option.city}, ${option.region}` }));
        const fixed = index === 0 || index === total - 1;
        if (!stop) return null;
        const message = (field: "facilityId" | "window" | "reference" | "instructions", meta: Meta) => {
            const code = shown(meta, attempted);
            return code ? (stopMessage(field, code, index) ?? undefined) : undefined;
        };

        return (
            <div role="group" aria-labelledby={labelId} className="border-border flex min-w-0 flex-col gap-4 border-t pt-4 first:border-t-0 first:pt-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <p id={labelId} className="haulr-label text-text">{fillTemplate(LANE_COPY.stop, { index: String(index + 1), type: LANE_COPY.types[stop.type] })}</p>
                    <div className="flex items-center gap-2">
                        {fixed ? null : (
                            <form.Field name={`stops[${index}].type`}>
                                {(field) => <SegmentedControl label={LANE_COPY.type} options={TYPES} value={field.state.value} onChange={field.handleChange} size="sm" />}
                            </form.Field>
                        )}
                        <PostStopControls index={index} total={total} removable={total > POSTING.stops.min} onMove={onMove} onRemove={() => onRemove(index)} />
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <form.Field name={`stops[${index}].facilityId`}>
                        {(field) => (
                            <Field id={stopFieldId(stop.key, "facilityId")} label={LANE_COPY.facility} error={message("facilityId", field.state.meta)}>
                                {(control) => (
                                    <Combobox
                                        {...control}
                                        options={options}
                                        value={field.state.value}
                                        onChange={(value) => {
                                            field.handleChange(value);
                                            field.handleBlur();
                                        }}
                                        placeholder={LANE_COPY.facilityPlaceholder}
                                        emptyLabel={LANE_COPY.noFacilities}
                                    />
                                )}
                            </Field>
                        )}
                    </form.Field>
                    <form.Field name={`stops[${index}].window`}>
                        {(field) => (
                            <Field
                                id={stopFieldId(stop.key, "window")}
                                label={LANE_COPY.window}
                                hint={facility ? fillTemplate(LANE_COPY.windowHint, { zone: zoneLabel(facility.timeZone) }) : LANE_COPY.windowHintBlank}
                                error={message("window", field.state.meta)}
                            >
                                {(control) =>
                                    facility ? (
                                        <DateRangeField
                                            {...control}
                                            {...bookingBounds(facility.timeZone, MINUTE_STEP, POSTING.horizonDays)}
                                            granularity="minute"
                                            timeZone={facility.timeZone}
                                            windowMinutes={POSTING.windowMinutes}
                                            value={field.state.value}
                                            onChange={(value) => {
                                                field.handleChange(value);
                                                field.handleBlur();
                                            }}
                                        />
                                    ) : (
                                        <p id={control.id} className="border-border-dark text-text-muted flex h-9 items-center border-b border-dashed text-xs">
                                            {LANE_COPY.windowHintBlank}
                                        </p>
                                    )
                                }
                            </Field>
                        )}
                    </form.Field>
                    <form.Field name={`stops[${index}].reference`}>
                        {(field) => (
                            <Field id={stopFieldId(stop.key, "reference")} label={LANE_COPY.reference} hint={LANE_COPY.referenceHint} error={message("reference", field.state.meta)}>
                                {(control) => (
                                    <Input {...control} value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} onBlur={field.handleBlur} maxLength={POSTING.reference} />
                                )}
                            </Field>
                        )}
                    </form.Field>
                    <form.Field name={`stops[${index}].instructions`}>
                        {(field) => (
                            <Field id={stopFieldId(stop.key, "instructions")} label={LANE_COPY.instructions} hint={LANE_COPY.instructionsHint} error={message("instructions", field.state.meta)}>
                                {(control) => (
                                    <Input {...control} value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} onBlur={field.handleBlur} maxLength={POSTING.instructions} />
                                )}
                            </Field>
                        )}
                    </form.Field>
                </div>
            </div>
        );
    },
});

export default PostStopCard;
