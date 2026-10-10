import { HELP_ROUTE, helpArticleRoute } from "@/lib/constants";
import { HELP_COPY } from "@/lib/data/help/copy";
import type { HelpArticle, HelpCategory } from "@/lib/types";

const SCHEMA = "https://schema.org";
const UNSAFE = /</g;

export const articleStructuredData = (article: HelpArticle, category: HelpCategory) =>
    JSON.stringify([
        {
            "@context": SCHEMA,
            "@type": "Article",
            headline: article.title,
            description: article.summary,
            dateModified: article.updated,
            articleSection: category.title,
        },
        {
            "@context": SCHEMA,
            "@type": "BreadcrumbList",
            itemListElement: [
                { "@type": "ListItem", position: 1, name: HELP_COPY.article.trail, item: HELP_ROUTE },
                { "@type": "ListItem", position: 2, name: category.title, item: `${HELP_ROUTE}#${category.key}` },
                { "@type": "ListItem", position: 3, name: article.title, item: helpArticleRoute(article.slug) },
            ],
        },
    ]).replace(UNSAFE, "\\u003c");
