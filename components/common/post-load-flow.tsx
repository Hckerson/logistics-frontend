"use client";
import { Fragment, useState, type ReactNode } from "react";
import AccountStandingNotice from "@/components/common/account-standing-notice";
import PostFreightStep from "@/components/common/post-freight-step";
import PostLaneStep from "@/components/common/post-lane-step";
import PostQuoteStep from "@/components/common/post-quote-step";
import PostReviewStep from "@/components/common/post-review-step";
import Button from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import StepList from "@/components/ui/step-list";
import type { FacilityOptionDto } from "@/lib/contract/schemas";
import { POST_COPY } from "@/lib/data/loads/post-copy";
import { QUOTE_COPY } from "@/lib/data/loads/post-quote-copy";
import { useDeadlineAlerts } from "@/lib/hooks/use-deadline-alerts";
import { usePostFlow } from "@/lib/hooks/use-post-flow";
import { saveFailureText } from "@/lib/loads/post-failures";
import { noticeText } from "@/lib/loads/post-opening";
import { stepStates } from "@/lib/loads/post-reducer";
import { POSTING } from "@/lib/loads/posting";
import type { PostStart, PostStep } from "@/lib/types";

interface Props {
    userId: string;
    start: PostStart;
    requested: PostStep | null;
    facilities: readonly FacilityOptionDto[];
}

const MARKS = [
    { minutes: POSTING.quoteWarnMinutes[0], message: QUOTE_COPY.announce.five },
    { minutes: POSTING.quoteWarnMinutes[1], message: QUOTE_COPY.announce.one },
];

const PHONE_STOPS = 2;

export default function PostLoadFlow({ userId, start, requested, facilities }: Props) {
    const flow = usePostFlow(userId, start, requested);
    const { draft, step, notice } = flow;
    const { live } = useDeadlineAlerts({ deadline: draft.quote?.validUntil ?? null, marks: MARKS, expired: QUOTE_COPY.announce.expired });
    const [staleFailure, setStaleFailure] = useState<string | null>(null);
    const message = notice && !flow.moved ? noticeText(notice) : null;
    const items = stepStates(draft, step).map(({ step: id, state }) => ({ id, state, label: POST_COPY.steps[id], reason: POST_COPY.locked[id] || undefined }));

    const resolve = async (keep: boolean) => {
        setStaleFailure(null);
        try {
            await flow.resolveStale(keep);
        } catch (error) {
            setStaleFailure(saveFailureText(error));
        }
    };

    const steps = {
        lane: <PostLaneStep flow={flow} facilities={facilities} />,
        freight: <PostFreightStep flow={flow} />,
        quote: <PostQuoteStep flow={flow} live={live} />,
        review: <PostReviewStep flow={flow} facilities={facilities} live={live} />,
    } satisfies Record<PostStep, ReactNode>;

    return (
        <div className="flex max-w-4xl flex-col gap-4">
            <AccountStandingNotice capabilities={["post"]} />
            <StepList label={POST_COPY.progress} items={items} stateLabels={POST_COPY.stepState} onSelect={flow.go} />
            {message ? (
                <div role="status" className="border-signal-info-edge bg-signal-info-wash flex flex-wrap items-center justify-between gap-3 border px-3 py-2 text-xs">
                    <p className="text-signal-info text-pretty">{message}</p>
                    {notice?.kind === "restored" ? (
                        <Button tone="outline" size="sm" onPress={flow.restart}>
                            {POST_COPY.startFresh}
                        </Button>
                    ) : null}
                </div>
            ) : null}
            {draft.lane.stops.length > PHONE_STOPS ? <p className="border-border text-text-secondary border px-3 py-2 text-xs sm:hidden">{POST_COPY.phone}</p> : null}
            <Fragment key={`${step}:${flow.revision}`}>{steps[step]}</Fragment>
            <ConfirmDialog
                isOpen={flow.stale}
                onOpenChange={(open) => (open ? undefined : void resolve(false))}
                title={POST_COPY.stale.title}
                consequence={POST_COPY.stale.body}
                confirmLabel={POST_COPY.stale.keepMine}
                cancelLabel={POST_COPY.stale.useSaved}
                pending={flow.resolving}
                error={staleFailure ?? undefined}
                onConfirm={() => void resolve(true)}
            />
        </div>
    );
}
