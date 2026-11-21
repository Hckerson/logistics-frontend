"use client";
import { useEffect, useRef, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import HudCorners from "@/components/ui/hud-corners";
import { POST_COPY } from "@/lib/data/loads/post-copy";
import { POST_STEPS, stepIndex } from "@/lib/loads/posting";
import type { PostStep } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    step: PostStep;
    focus: boolean;
    intro: string;
    onSubmit: () => void;
    onBack?: () => void;
    pending?: boolean;
    pendingLabel?: string;
    submitLabel?: string;
    submitReason?: string;
    status?: ReactNode;
    children: ReactNode;
}

export default function PostStepFrame(props: Props) {
    const { step, focus, intro, onSubmit, onBack, pending = false, pendingLabel = POST_COPY.saving, submitLabel = POST_COPY.continue, submitReason, status, children } = props;
    const heading = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        if (focus) heading.current?.focus();
    }, [focus]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (!pending) onSubmit();
    };

    return (
        <form noValidate onSubmit={submit} className="border-border-dark bg-background relative flex flex-col border">
            <HudCorners />
            <header className="border-border flex flex-col gap-1 border-b px-4 py-3 sm:px-5">
                <p className="haulr-label text-text-muted">{fillTemplate(POST_COPY.stepOf, { current: String(stepIndex(step) + 1), total: String(POST_STEPS.length) })}</p>
                <h2 ref={heading} tabIndex={-1} className="text-text text-lg tracking-tight outline-none">
                    {POST_COPY.steps[step]}
                </h2>
                <p className="text-text-secondary text-xs text-pretty">{intro}</p>
            </header>
            <div className="flex flex-col gap-5 p-4 sm:p-5">{children}</div>
            <footer className="border-border flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 sm:px-5">
                {onBack ? (
                    <Button tone="ghost" size="md" icon={ArrowLeft} onPress={onBack}>
                        {POST_COPY.back}
                    </Button>
                ) : (
                    <span aria-hidden />
                )}
                <div className="flex flex-wrap items-center gap-3">
                    {status}
                    <Button type="submit" tone="ink" size="md" trailing={ArrowRight} pending={pending} pendingLabel={pendingLabel} disabledReason={submitReason}>
                        {submitLabel}
                    </Button>
                </div>
            </footer>
        </form>
    );
}
