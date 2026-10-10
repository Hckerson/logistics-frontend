import type { z } from "zod";
import type { articleFeedbackSchema } from "@/lib/validations/help";
import type { FEEDBACK_REASONS, HELP_CATEGORY_KEYS } from "@/lib/help/constants";

export type HelpCategoryKey = (typeof HELP_CATEGORY_KEYS)[number];

export type FeedbackReason = (typeof FEEDBACK_REASONS)[number];

export interface HelpCategory {
    key: HelpCategoryKey;
    title: string;
    summary: string;
}

export interface HelpStep {
    id: string;
    title: string;
    body: readonly string[];
}

export interface HelpArticle {
    slug: string;
    category: HelpCategoryKey;
    title: string;
    summary: string;
    updated: string;
    steps: readonly HelpStep[];
    related: readonly string[];
}

export interface HelpArticleLink {
    slug: string;
    title: string;
    summary: string;
}

export interface HelpShelf {
    category: HelpCategory;
    articles: readonly HelpArticleLink[];
}

export type ArticleFeedback = z.infer<typeof articleFeedbackSchema>;
