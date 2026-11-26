import { WarningFilled } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import ButtonLink from "@/components/ui/button-link";
import { appRoutes } from "@/lib/app-routes";
import { QUOTE_COPY, REVIEW_COPY } from "@/lib/data/loads/post-quote-copy";
import type { PostFix, PostProblem } from "@/lib/types";

interface Props {
    problem: PostProblem;
    onFix: (fix: Exclude<PostFix, "onboarding">) => void;
    pending?: boolean;
}

const LABELS = { retry: QUOTE_COPY.retry, lane: QUOTE_COPY.editLane, quote: QUOTE_COPY.requote } as const satisfies Record<Exclude<PostFix, "onboarding">, string>;

export default function PostProblemNotice({ problem: { text, fix }, onFix, pending = false }: Props) {
    return (
        <div role="alert" className="border-signal-danger-edge bg-signal-danger-wash flex flex-wrap items-center justify-between gap-3 border px-3 py-2.5 text-xs">
            <p className="text-text flex min-w-0 flex-1 items-start gap-2 text-pretty">
                <WarningFilled aria-hidden className="text-signal-danger mt-px size-3.5 shrink-0" />
                {text}
            </p>
            {fix === "onboarding" ? (
                <ButtonLink href={appRoutes.shipperOnboarding()} tone="outline" size="sm">
                    {REVIEW_COPY.onboarding}
                </ButtonLink>
            ) : fix ? (
                <Button tone="outline" size="sm" pending={pending} onPress={() => onFix(fix)}>
                    {LABELS[fix]}
                </Button>
            ) : null}
        </div>
    );
}
