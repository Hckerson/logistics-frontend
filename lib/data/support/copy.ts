import type { ChoiceOption, TicketCategory, TicketStatus, TicketUrgency } from "@/lib/types";
import { TICKET_LIMITS } from "@/lib/support/constants";

const RESPONSE: Record<TicketUrgency, string> = { urgent: "15 minutes", high: "2 hours", normal: "1 business day" };

export const SUPPORT_HOURS = {
    label: "Support hours",
    lines: [
        { id: "operations", label: "Operations and drivers", value: "24/7" },
        { id: "accounts", label: "Shippers and carriers", value: "06:00–22:00 Central, every day" },
    ],
} as const;

export const SUPPORT_COPY = {
    eyebrow: "Contact support",
    title: "Talk to a person.",
    lead: "Tell us once, with the details, and we'll reply within the time shown.",
    panel: { label: "New ticket", status: "Open", sent: "Sent", note: "Design study" },
    fields: {
        category: { index: "01", label: "Topic" },
        urgency: { index: "02", label: "Urgency" },
        subject: { name: "subject", index: "03", label: "Subject", placeholder: "One line about the problem" },
        description: { index: "04", label: "Details", placeholder: "What happened, what you expected, and any load or invoice numbers." },
        load: { name: "load", index: "05", label: "Load reference", placeholder: "HL-48213" },
        email: { name: "email", index: "06", label: "Your email", type: "email", autoComplete: "email", placeholder: "name@company.com" },
    },
    optional: "Optional",
    categories: [
        { value: "account", label: "Account and sign-in" },
        { value: "loads", label: "Loads and tracking" },
        { value: "billing", label: "Billing and payments" },
        { value: "claims", label: "Claims" },
        { value: "technical", label: "Something's broken" },
        { value: "other", label: "Something else" },
    ] satisfies ChoiceOption<TicketCategory>[],
    urgencies: [
        { value: "urgent", label: "Urgent", detail: `Load at risk, can't sign in, or a payment failed. Reply within ${RESPONSE.urgent}.` },
        { value: "high", label: "High", detail: `Work is blocked. Reply within ${RESPONSE.high}.` },
        { value: "normal", label: "Normal", detail: `A question, or a fix that can wait. Reply within ${RESPONSE.normal}.` },
    ] satisfies ChoiceOption<TicketUrgency>[],
    response: RESPONSE,
    context: { label: "Attached context", reference: "Error reference", article: "Help article", q: "Searched for", topic: "Topic" },
    prefill: { article: "Question about “{title}”" },
    draft: "Draft saved on this device",
    submit: "Send to support",
    pending: "Sending…",
    receipt: {
        label: "Ticket opened",
        body: "We'll reply within {time}. Replies go to {email}.",
        another: "Open another ticket",
    },
    errors: {
        fields: {
            category: { missing: "Choose a topic." },
            urgency: { missing: "Choose how urgent this is." },
            subject: { missing: "Add a subject.", long: `Keep the subject under ${TICKET_LIMITS.subject} characters.` },
            description: { missing: "Describe the problem.", long: `Keep the details under ${TICKET_LIMITS.description} characters.` },
            load: { missing: "Check the load reference.", long: `Load references are under ${TICKET_LIMITS.load} characters.` },
            email: { missing: "Enter your email so we can reply.", invalid: "Enter an email address like name@company.com." },
        },
        failed: "We couldn't send it. Your draft is saved on this device, so try again.",
    },
    history: {
        label: "Your tickets",
        filters: { all: "All", open: "Open", waiting: "Waiting on you", resolved: "Resolved" } satisfies Record<TicketStatus | "all", string>,
        empty: "No tickets yet. Anything you send appears here.",
        failed: "Your tickets couldn't load. The form still works.",
        signedOut: "Sign in to follow the tickets you've opened.",
        signIn: "Sign in",
        dateFormat: "d MMM",
    },
    meta: { title: "Contact support · Haulr" },
} as const;
