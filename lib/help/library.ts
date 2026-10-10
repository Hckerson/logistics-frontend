import { ACCOUNT_ARTICLES } from "@/lib/data/help/articles-account";
import { FREIGHT_ARTICLES } from "@/lib/data/help/articles-freight";
import { MONEY_ARTICLES } from "@/lib/data/help/articles-money";
import { HELP_CATEGORIES } from "@/lib/data/help/categories";
import { HELP_CATEGORY_KEYS } from "@/lib/help/constants";
import type { HelpArticle, HelpArticleLink, HelpCategory, HelpCategoryKey, HelpShelf } from "@/lib/types";

export const HELP_ARTICLES: readonly HelpArticle[] = [...FREIGHT_ARTICLES, ...MONEY_ARTICLES, ...ACCOUNT_ARTICLES];

export const categoryOf = (key: HelpCategoryKey): HelpCategory => ({ key, ...HELP_CATEGORIES[key] });

const linkOf = ({ slug, title, summary }: HelpArticle): HelpArticleLink => ({ slug, title, summary });

export const findArticle = (slug: string) => HELP_ARTICLES.find((article) => article.slug === slug) ?? null;

export const shelvesOf = (articles: readonly HelpArticle[]): HelpShelf[] =>
    HELP_CATEGORY_KEYS.map((key) => ({
        category: categoryOf(key),
        articles: articles.filter((article) => article.category === key).map(linkOf),
    })).filter((shelf) => shelf.articles.length > 0);

export const HELP_SHELVES = shelvesOf(HELP_ARTICLES);

export const relatedTo = (article: HelpArticle): HelpArticleLink[] =>
    HELP_ARTICLES.filter((candidate) => article.related.includes(candidate.slug)).map(linkOf);

export const helpParams = () => HELP_ARTICLES.map(({ slug }) => ({ slug }));
