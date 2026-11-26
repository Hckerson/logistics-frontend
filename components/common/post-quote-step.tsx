"use client";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Renew } from "@carbon/icons-react";
import PostProblemNotice from "@/components/common/post-problem-notice";
import PostQuotePanel from "@/components/common/post-quote-panel";
import PostStepFrame from "@/components/common/post-step-frame";
import { useAnnounce } from "@/components/providers/announcer-provider";
import Button from "@/components/ui/button";
import ProgressLine from "@/components/ui/progress-line";
import { POST_COPY } from "@/lib/data/loads/post-copy";
import { QUOTE_COPY } from "@/lib/data/loads/post-quote-copy";
import { ERROR_COPY, LOADING_ANNOUNCE_MS, LOADING_SLOW_MS } from "@/lib/errors/constants";
import type { PostFlow } from "@/lib/hooks/use-post-flow";
import { useQuote } from "@/lib/hooks/use-post-load";
import { useSlow } from "@/lib/hooks/use-slow";
import { quoteProblem } from "@/lib/loads/post-failures";
import { POSTING } from "@/lib/loads/posting";
import type { PostFix, PostProblem } from "@/lib/types";
import { formatMoney } from "@/lib/utils/currency";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    flow: PostFlow;
    live: boolean;
}

export default function PostQuoteStep({ flow, live }: Props) {
    const { draft } = flow;
    const quoting = useQuote();
    const announce = useAnnounce();
    const [problem, setProblem] = useState<PostProblem | null>(null);
    const [previousCents, setPreviousCents] = useState<number | null>(null);
    const asked = useRef(false);
    const pending = quoting.isPending;
    const announced = useSlow(pending, LOADING_ANNOUNCE_MS);
    const slow = useSlow(pending, LOADING_SLOW_MS);
    const timedOut = useSlow(pending, POSTING.quoteTimeoutMs);

    const request = async () => {
        if (!draft.draftId) return;
        setProblem(null);
        if (draft.quote) setPreviousCents(draft.quote.price.totalCents);
        try {
            const quote = await quoting.mutateAsync({ draftId: draft.draftId, version: draft.version });
            flow.dispatch({ type: "quoted", quote });
            announce({ message: fillTemplate(QUOTE_COPY.announce.arrived, { amount: formatMoney(quote.price.totalCents, quote.price.currency) }) });
        } catch (error) {
            flow.watch(error);
            setProblem(quoteProblem(error, draft.lane, new Date().getTime()));
        }
    };

    const fix = (next: Exclude<PostFix, "onboarding">) => (next === "lane" ? flow.go("lane") : void request());

    const onOpen = useEffectEvent(() => void request());

    useEffect(() => {
        if (asked.current) return;
        asked.current = true;
        if (!draft.quote || !live) onOpen();
    }, [draft.quote, live]);

    const waiting = pending && !draft.quote;
    const progress = timedOut ? null : slow ? QUOTE_COPY.slow : announced ? QUOTE_COPY.getting : "";

    return (
        <PostStepFrame
            step="quote"
            focus={flow.moved}
            intro={QUOTE_COPY.intro}
            onSubmit={() => flow.go("review")}
            onBack={() => flow.go("freight")}
            submitReason={live && !pending ? undefined : POST_COPY.locked.review}
        >
            {!draft.draftId ? <p className="text-text-secondary text-sm">{fillTemplate(QUOTE_COPY.empty, { step: POST_COPY.steps.lane.toLowerCase() })}</p> : null}
            {waiting && progress !== null ? (
                <div className="flex flex-col gap-2">
                    <ProgressLine className="bg-border" />
                    <p aria-live="polite" className="text-text-muted text-xs empty:hidden">
                        {progress}
                    </p>
                </div>
            ) : null}
            {timedOut ? <PostProblemNotice problem={{ text: ERROR_COPY.timeout, fix: "retry" }} onFix={fix} /> : null}
            {problem && !pending ? <PostProblemNotice problem={problem} onFix={fix} /> : null}
            {draft.quote ? (
                <>
                    <PostQuotePanel quote={draft.quote} live={live} previousCents={previousCents} />
                    <Button tone="outline" size="sm" icon={Renew} pending={pending} pendingLabel={QUOTE_COPY.requoting} onPress={() => void request()} className="self-start">
                        {QUOTE_COPY.requote}
                    </Button>
                </>
            ) : null}
        </PostStepFrame>
    );
}
