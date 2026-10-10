import { Link as LinkIcon } from "@carbon/icons-react";
import { HELP_COPY } from "@/lib/data/help/copy";
import type { HelpStep } from "@/lib/types";
import { twoDigits } from "@/lib/utils/number";

interface Props {
    steps: readonly HelpStep[];
}

export default function ArticleSteps({ steps }: Props) {
    return (
        <ol className="flex flex-col gap-10">
            {steps.map((step, index) => (
                <li key={step.id} id={step.id} className="group/step flex scroll-mt-[calc(var(--haulr-header)+2rem)] gap-5">
                    <span className="haulr-label text-accent pt-1 tabular-nums">{twoDigits(index + 1)}</span>
                    <div className="flex min-w-0 flex-col gap-2">
                        <h2 className="text-text flex items-center gap-2 text-lg font-medium">
                            {step.title}
                            <a
                                href={`#${step.id}`}
                                aria-label={`${HELP_COPY.article.anchor}: ${step.title}`}
                                className="text-text-muted hover:text-text focus-visible:outline-text opacity-0 transition-opacity group-hover/step:opacity-100 focus-visible:opacity-100 focus-visible:outline-2"
                            >
                                <LinkIcon aria-hidden className="size-4" />
                            </a>
                        </h2>
                        {step.body.map((paragraph) => (
                            <p key={paragraph} className="text-text-secondary text-sm leading-relaxed">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </li>
            ))}
        </ol>
    );
}
