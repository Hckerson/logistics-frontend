import Link from "next/link";
import ArticleFeedback from "@/components/help/article-feedback";
import ArticleSteps from "@/components/help/article-steps";
import HelpEscalation from "@/components/help/help-escalation";
import HelpLink from "@/components/help/help-link";
import PublicPage from "@/components/common/public-page";
import { HELP_ROUTE } from "@/lib/constants";
import { HELP_COPY } from "@/lib/data/help/copy";
import { articleStructuredData } from "@/lib/help/structured";
import type { HelpArticle as Article, HelpArticleLink, HelpCategory } from "@/lib/types";
import { dateFormatter } from "@/lib/utils/date-formatter";

interface Props {
    article: Article;
    category: HelpCategory;
    related: readonly HelpArticleLink[];
}

const { article: copy } = HELP_COPY;
const TRAIL = "text-text-muted hover:text-text transition-colors";

export default function HelpArticle({ article, category, related }: Props) {
    return (
        <PublicPage>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: articleStructuredData(article, category) }} />
            <header className="flex max-w-3xl flex-col gap-4">
                <nav aria-label={copy.trail} className="haulr-label flex flex-wrap items-center gap-2">
                    <Link href={HELP_ROUTE} className={TRAIL}>
                        {copy.trail}
                    </Link>
                    <span aria-hidden className="text-text-muted">/</span>
                    <Link href={`${HELP_ROUTE}#${category.key}`} className={TRAIL}>
                        {category.title}
                    </Link>
                </nav>
                <h1 className="haulr-title text-text overflow-hidden pb-[0.08em]">
                    <span className="haulr-rise block">{article.title}</span>
                </h1>
                <p className="text-text-secondary max-w-xl text-(length:--haulr-lead) text-pretty">{article.summary}</p>
                <p className="haulr-label text-text-muted">
                    {copy.updated.replace("{date}", dateFormatter(article.updated, copy.dateFormat))}
                </p>
            </header>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,44rem)_17rem] lg:gap-16 xl:gap-24">
                <article className="flex min-w-0 flex-col gap-12">
                    <ArticleSteps steps={article.steps} />
                    <div className="border-border border-t pt-6">
                        <ArticleFeedback slug={article.slug} />
                    </div>
                    {related.length > 0 ? (
                        <section aria-labelledby="related-help" className="flex flex-col gap-3">
                            <h2 id="related-help" className="haulr-label text-text-muted">
                                {copy.related}
                            </h2>
                            <ul className="border-border border-t">
                                {related.map((link) => (
                                    <li key={link.slug}>
                                        <HelpLink article={link} />
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ) : null}
                </article>
                <aside className="lg:sticky lg:top-[calc(var(--haulr-header)+2rem)] lg:self-start">
                    <HelpEscalation context={{ article: article.slug }} />
                </aside>
            </div>
        </PublicPage>
    );
}
