"use client";
import { useState, useSyncExternalStore } from "react";
import ConsoleLink from "@/components/auth/console-link";
import ChoiceGrid from "@/components/common/choice-grid";
import Button from "@/components/ui/button";
import { supportRoute } from "@/lib/constants";
import { HELP_COPY } from "@/lib/data/help/copy";
import { FEEDBACK_REASONS, HELP_FEEDBACK_STORAGE } from "@/lib/help/constants";
import { useArticleFeedback } from "@/lib/hooks/use-article-feedback";
import type { ArticleFeedback as Feedback, FeedbackReason } from "@/lib/types";

interface Props {
    slug: string;
}

const { feedback, escalation } = HELP_COPY;
const REASONS = FEEDBACK_REASONS.map((value) => ({ value, label: feedback.reasons[value] }));
const ignore = () => () => undefined;

export default function ArticleFeedback({ slug }: Props) {
    const key = `${HELP_FEEDBACK_STORAGE}.${slug}`;
    const given = useSyncExternalStore(ignore, () => sessionStorage.getItem(key) !== null, () => false);
    const send = useArticleFeedback();
    const [helpful, setHelpful] = useState<boolean | null>(null);
    const [reason, setReason] = useState<FeedbackReason | null>(null);
    const [failed, setFailed] = useState(false);
    const [sent, setSent] = useState(false);

    const submit = (answer: Feedback) => {
        setFailed(false);
        send.mutate(answer, {
            onSuccess: (result) => {
                if (!result.ok) return setFailed(true);
                sessionStorage.setItem(key, String(answer.helpful));
                setSent(true);
            },
            onError: () => setFailed(true),
        });
    };

    const answerYes = () => {
        setHelpful(true);
        submit({ slug, helpful: true });
    };

    if (sent || given) {
        return (
            <div aria-live="polite" className="flex flex-col gap-4">
                <p className="text-text text-sm">{helpful === false ? feedback.thanksNo : feedback.thanks}</p>
                {helpful === false ? <ConsoleLink href={supportRoute({ article: slug })} label={escalation.action} /> : null}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
                <p className="text-text text-sm font-medium">{feedback.question}</p>
                <Button tone="quiet" size="sm" aria-pressed={helpful === true} disabled={send.isPending} onClick={answerYes}>
                    {feedback.yes}
                </Button>
                <Button tone="quiet" size="sm" aria-pressed={helpful === false} disabled={send.isPending} onClick={() => setHelpful(false)}>
                    {feedback.no}
                </Button>
            </div>
            {helpful === false ? (
                <div className="flex max-w-md flex-col gap-3">
                    <ChoiceGrid id={`${slug}-reason`} name="reason" legend={feedback.reasonLabel} options={REASONS} value={reason} onChange={setReason} />
                    <Button size="sm" isLoading={send.isPending} onClick={() => submit({ slug, helpful: false, reason: reason ?? undefined })} className="self-start">
                        {send.isPending ? feedback.sending : feedback.send}
                    </Button>
                </div>
            ) : null}
            <p aria-live="polite" className="text-error text-xs empty:hidden">
                {failed ? feedback.failed : ""}
            </p>
        </div>
    );
}
