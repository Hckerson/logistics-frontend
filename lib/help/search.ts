import { HELP_ARTICLES, shelvesOf } from "@/lib/help/library";

const WORD = /\s+/;

const index = new Map(
    HELP_ARTICLES.map((article) => [
        article.slug,
        [article.title, article.summary, ...article.steps.flatMap((step) => [step.title, ...step.body])].join(" ").toLowerCase(),
    ]),
);

export const searchHelp = (query: string) => {
    const words = query.toLowerCase().split(WORD).filter(Boolean);
    if (words.length === 0) return [];
    return shelvesOf(HELP_ARTICLES.filter((article) => words.every((word) => index.get(article.slug)?.includes(word))));
};
