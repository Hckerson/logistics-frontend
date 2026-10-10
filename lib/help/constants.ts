export const HELP_CATEGORY_KEYS = [
    "getting-started",
    "shipping",
    "hauling",
    "drivers",
    "billing",
    "tracking",
    "claims",
    "account",
    "compliance",
    "integrations",
    "administration",
] as const;

export const FEEDBACK_REASONS = ["steps-differ", "missing-detail", "hard-to-follow", "other"] as const;

export const HELP_QUERY = "q";

export const HELP_SEARCH_DELAY_MS = 250;

export const HELP_FEEDBACK_STORAGE = "haulr.help.feedback";
