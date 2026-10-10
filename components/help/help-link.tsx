import Link from "next/link";
import { ArrowRight } from "@carbon/icons-react";
import { helpArticleRoute } from "@/lib/constants";
import type { HelpArticleLink } from "@/lib/types";

interface Props {
    article: HelpArticleLink;
}

export default function HelpLink({ article }: Props) {
    return (
        <Link
            href={helpArticleRoute(article.slug)}
            className="group border-border hover:bg-background-muted/40 focus-visible:outline-text flex items-start justify-between gap-4 border-b py-3 pr-2 transition-colors focus-visible:outline-2"
        >
            <span className="flex min-w-0 flex-col gap-1">
                <span className="text-text group-hover:text-accent text-sm font-medium transition-colors">{article.title}</span>
                <span className="text-text-muted text-xs">{article.summary}</span>
            </span>
            <ArrowRight aria-hidden className="text-text-muted mt-0.5 size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
    );
}
