import type { ReactNode } from "react";
import { Edit } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import { REVIEW_COPY } from "@/lib/data/loads/post-quote-copy";
import type { PostStep, ReviewGroup, ReviewRow } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    title: string;
    rows: readonly ReviewRow[];
    step?: ReviewGroup["step"] | Extract<PostStep, "quote">;
    aside?: string | null;
    onEdit?: (step: PostStep) => void;
    children?: ReactNode;
}

export default function PostReviewSummary({ title, rows, step, aside, onEdit, children }: Props) {
    return (
        <section aria-label={title} className="border-border flex flex-col gap-3 border-t pt-4 first:border-t-0 first:pt-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="haulr-label text-text">
                    {title}
                    {aside ? <span className="text-text-muted ml-2">{aside}</span> : null}
                </h3>
                {step && onEdit ? (
                    <Button tone="ghost" size="sm" icon={Edit} onPress={() => onEdit(step)}>
                        {fillTemplate(REVIEW_COPY.edit, { step: title.toLowerCase() })}
                    </Button>
                ) : null}
            </div>
            {rows.length > 0 ? (
                <dl className="grid gap-x-4 gap-y-2.5 text-sm sm:grid-cols-[minmax(8rem,12rem)_1fr]">
                    {rows.map((row) => (
                        <div key={row.term} className="contents">
                            <dt className="text-text-muted text-xs sm:pt-0.5">{row.term}</dt>
                            <dd className="text-text flex min-w-0 flex-col gap-0.5 break-words">
                                {row.details.map((detail, index) => (
                                    <span key={`${index}:${detail}`} className={index === 0 ? undefined : "text-text-secondary text-xs"}>
                                        {detail}
                                    </span>
                                ))}
                            </dd>
                        </div>
                    ))}
                </dl>
            ) : null}
            {children}
        </section>
    );
}
