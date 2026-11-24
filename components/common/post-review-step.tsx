"use client";
import { useId, useState } from "react";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import AreaField from "@/components/common/area-field";
import PostProblemNotice from "@/components/common/post-problem-notice";
import PostQuotePanel from "@/components/common/post-quote-panel";
import PostReviewSummary from "@/components/common/post-review-summary";
import PostStepFrame from "@/components/common/post-step-frame";
import { useAnnounce } from "@/components/providers/announcer-provider";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { appRoutes } from "@/lib/app-routes";
import type { FacilityOptionDto } from "@/lib/contract/schemas";
import { REVIEW_COPY } from "@/lib/data/loads/post-quote-copy";
import type { PostFlow } from "@/lib/hooks/use-post-flow";
import { usePostLoad } from "@/lib/hooks/use-post-load";
import { postProblem } from "@/lib/loads/post-failures";
import { reviewGroups, strategyRow } from "@/lib/loads/post-review";
import { heldTime, POSTING } from "@/lib/loads/posting";
import type { PostFix, PostProblem } from "@/lib/types";
import { formatMoney } from "@/lib/utils/currency";
import { fillTemplate } from "@/lib/utils/fill-template";
import { postNoteSchema } from "@/lib/validations/posting";

interface Props {
    flow: PostFlow;
    facilities: readonly FacilityOptionDto[];
    live: boolean;
}

const { confirm } = REVIEW_COPY;

export default function PostReviewStep({ flow, facilities, live }: Props) {
    const { draft } = flow;
    const { quote } = draft;
    const router = useRouter();
    const announce = useAnnounce();
    const posting = usePostLoad();
    const noteId = useId();
    const [idempotencyKey] = useState(() => nanoid());
    const [note, setNote] = useState("");
    const [confirming, setConfirming] = useState(false);
    const [problem, setProblem] = useState<PostProblem | null>(null);
    const approval = quote?.approval.required ?? false;
    const noteError = postNoteSchema.safeParse(note).success ? undefined : fillTemplate(REVIEW_COPY.noteLong, { max: String(POSTING.note) });
    const busy = posting.isPending || posting.isSuccess;

    const post = async () => {
        if (!quote || !draft.draftId) return;
        setProblem(null);
        try {
            const result = await posting.mutateAsync({
                draftId: draft.draftId,
                input: { version: draft.version, quoteId: quote.id, idempotencyKey, note: approval ? note.trim() || null : null },
            });
            flow.finish();
            announce({ message: fillTemplate(REVIEW_COPY.done[result.status], { load: result.loadId }) });
            router.push(appRoutes.load(result.loadId));
        } catch (error) {
            flow.watch(error);
            setConfirming(false);
            setProblem(postProblem(error, live));
        }
    };

    const fix = (next: Exclude<PostFix, "onboarding">) => (next === "retry" ? setConfirming(true) : flow.go(next));

    const terms = quote && { amount: formatMoney(quote.price.totalCents, quote.price.currency), time: heldTime(quote.validUntil), approvers: quote.approval.approvers.join(", ") };
    const consequence = !terms ? "" : !approval ? confirm.posted : quote?.approval.approvers.length ? confirm.approval : confirm.nobody;

    return (
        <PostStepFrame
            step="review"
            focus={flow.moved}
            intro={REVIEW_COPY.intro}
            onSubmit={() => (noteError ? undefined : setConfirming(true))}
            onBack={() => flow.go("quote")}
            submitLabel={approval ? REVIEW_COPY.submit : REVIEW_COPY.post}
            submitReason={live ? undefined : REVIEW_COPY.noPrice}
            pending={busy}
            pendingLabel={REVIEW_COPY.posting}
        >
            {problem ? <PostProblemNotice problem={problem} onFix={fix} /> : null}
            {reviewGroups(draft.lane, draft.freight, facilities).map((group) => (
                <PostReviewSummary key={group.step} title={group.title} rows={group.rows} step={group.step} aside={group.aside} onEdit={flow.go} />
            ))}
            <PostReviewSummary title={REVIEW_COPY.groups.quote} rows={[]} step="quote" onEdit={flow.go}>
                {quote ? <PostQuotePanel quote={quote} live={live} previousCents={null} /> : <p className="text-text-secondary text-sm">{REVIEW_COPY.noPrice}</p>}
            </PostReviewSummary>
            <PostReviewSummary title={REVIEW_COPY.groups.strategy} rows={[strategyRow]} />
            {approval ? (
                <AreaField
                    id={noteId}
                    label={REVIEW_COPY.note}
                    value={note}
                    error={noteError}
                    onChange={(event) => setNote(event.target.value)}
                    aside={<span className="text-text-muted text-xs">{REVIEW_COPY.noteHint}</span>}
                />
            ) : null}
            <ConfirmDialog
                isOpen={confirming}
                onOpenChange={setConfirming}
                kicker={confirm.kicker}
                title={confirm.title}
                consequence={terms ? fillTemplate(consequence, terms) : ""}
                confirmLabel={approval ? REVIEW_COPY.submit : REVIEW_COPY.post}
                cancelLabel={confirm.cancel}
                pending={busy}
                onConfirm={() => void post()}
            />
        </PostStepFrame>
    );
}
