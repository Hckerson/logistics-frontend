import type { FeedbackReason } from "@/lib/types";

export const HELP_COPY = {
    eyebrow: "Help center",
    title: "How can we help?",
    lead: "Search the guides or browse a topic. Most answers take a minute to read.",
    search: {
        label: "Search help",
        placeholder: "Try reset password or detention",
        unavailable: "Search isn't available right now. Every topic below still works.",
    },
    results: {
        count: { one: "1 article", other: "{count} articles" },
        none: "Nothing matches “{query}”.",
        hint: "Try fewer words, browse a topic, or ask a person.",
        topics: "Browse a topic",
    },
    nav: { label: "Help categories", count: { one: "1 article", other: "{count} articles" } },
    escalation: {
        label: "Still stuck?",
        body: "Talk to a person. We'll pick up from where you are.",
        action: "Contact support",
    },
    article: {
        trail: "Help center",
        updated: "Updated {date}",
        dateFormat: "d MMM yyyy",
        anchor: "Link to this step",
        related: "Related help",
    },
    feedback: {
        question: "Did this answer your question?",
        yes: "Yes",
        no: "No",
        reasonLabel: "What was missing?",
        reasons: {
            "steps-differ": "The steps don't match what I see",
            "missing-detail": "Something is missing",
            "hard-to-follow": "It's hard to follow",
            other: "Something else",
        } satisfies Record<FeedbackReason, string>,
        send: "Send",
        sending: "Sending…",
        thanks: "Thanks, noted.",
        thanksNo: "Thanks. A person can help with the rest.",
        failed: "That didn't go through. Reading isn't affected.",
    },
    meta: { title: "Help center · Haulr", article: "{title} · Haulr help" },
} as const;
