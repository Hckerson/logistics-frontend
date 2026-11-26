"use client";
import { useEffect, useState } from "react";
import { Add } from "@carbon/icons-react";
import { useStore } from "@tanstack/react-form";
import ErrorSummary from "@/components/common/error-summary";
import PostStepFrame from "@/components/common/post-step-frame";
import PostStopCard from "@/components/common/post-stop-card";
import { useAnnounce } from "@/components/providers/announcer-provider";
import Button from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import type { FacilityOptionDto } from "@/lib/contract/schemas";
import { LANE_COPY, POST_COPY } from "@/lib/data/loads/post-copy";
import { useAppForm } from "@/lib/hooks/use-app-form";
import { useFormProblems } from "@/lib/hooks/use-form-problems";
import type { PostFlow } from "@/lib/hooks/use-post-flow";
import { saveFailureText } from "@/lib/loads/post-failures";
import { laneFormOptions } from "@/lib/loads/post-forms";
import { laneProblems } from "@/lib/loads/post-problems";
import { blankStop, POSTING, stepIndex } from "@/lib/loads/posting";
import type { StopEntry } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";
import { pluralize } from "@/lib/utils/plural";

interface Props {
    flow: PostFlow;
    facilities: readonly FacilityOptionDto[];
}

const filled = (stop: StopEntry) => Boolean(stop.facilityId || stop.window || stop.reference.trim() || stop.instructions.trim());

export default function PostLaneStep({ flow, facilities }: Props) {
    const { draft } = flow;
    const announce = useAnnounce();
    const problems = useFormProblems<string>();
    const [removing, setRemoving] = useState<number | null>(null);
    const [failure, setFailure] = useState<string | null>(null);
    const form = useAppForm({
        ...laneFormOptions,
        defaultValues: draft.lane,
        onSubmit: async ({ value }) => {
            setFailure(null);
            problems.reset();
            try {
                const saved = await flow.persist(value, stepIndex(draft.reached) >= stepIndex("quote") ? draft.freight : null);
                flow.dispatch({ type: "lane", lane: value, saved });
                flow.go("freight");
            } catch (error) {
                setFailure(saveFailureText(error));
            }
        },
        onSubmitInvalid: ({ value }) => problems.fail(laneProblems(value)),
    });
    const stops = useStore(form.store, (state) => state.values.stops);
    const { onLeave } = flow;

    useEffect(() => onLeave(() => ({ type: "stash", lane: form.state.values })), [onLeave, form]);
    const total = stops.length;

    const counted = (count: number) => announce({ message: pluralize(count, LANE_COPY.count) });

    const add = () => {
        void form.insertFieldValue("stops", total - 1, blankStop("delivery"));
        counted(total + 1);
    };

    const remove = (index: number) => {
        void form.removeFieldValue("stops", index);
        setRemoving(null);
        counted(total - 1);
    };

    const removeAsked = (index: number) => (stops[index] && filled(stops[index]) ? setRemoving(index) : remove(index));

    return (
        <PostStepFrame
            step="lane"
            focus={flow.moved}
            intro={LANE_COPY.intro}
            onSubmit={() => void form.handleSubmit()}
            pending={flow.saving}
            status={failure ? <p className="text-error text-xs">{failure}</p> : null}
        >
            <ErrorSummary
                problems={problems.problems}
                attempt={problems.attempt}
                heading={POST_COPY.errorsHeading}
                count={pluralize(problems.problems.length, POST_COPY.errorsCount)}
                fieldId={(field) => field}
            />
            <div className="flex flex-col gap-4">
                {stops.map((stop, index) => (
                    <PostStopCard key={stop.key} form={form} index={index} total={total} facilities={facilities} onMove={(from, to) => form.moveFieldValues("stops", from, to)} onRemove={removeAsked} />
                ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <Button
                    tone="outline"
                    size="sm"
                    icon={Add}
                    onPress={add}
                    disabledReason={total >= POSTING.stops.max ? fillTemplate(LANE_COPY.addLimit, { max: String(POSTING.stops.max) }) : undefined}
                >
                    {LANE_COPY.add}
                </Button>
                <span className="haulr-label text-text-muted">{pluralize(total, LANE_COPY.count)}</span>
            </div>
            <ConfirmDialog
                isOpen={removing !== null}
                onOpenChange={(open) => (open ? undefined : setRemoving(null))}
                title={fillTemplate(LANE_COPY.removeTitle, { index: String((removing ?? 0) + 1) })}
                consequence={LANE_COPY.removeBody}
                confirmLabel={LANE_COPY.removeConfirm}
                cancelLabel={LANE_COPY.keep}
                destructive
                onConfirm={() => (removing === null ? undefined : remove(removing))}
            />
        </PostStepFrame>
    );
}
