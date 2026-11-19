import type { ChoiceOption, ImportSplit } from "@/lib/types";
import type { ImportTenderDto } from "@/lib/contract/schemas";

export const IMPORT_PRICE_COPY = {
    label: "Price and post",
    unavailable: "Pricing is unavailable right now, so every row will be saved as a draft with a custom quote request.",
    quote: "Quotes valid for",
    expired: "Quotes expired. Price the batch again before creating loads.",
    reprice: "Price again",
    repricing: "Pricing…",
    split: {
        postNow: { label: "Post now", detail: "Within your spend limit. Offered to carriers as soon as you confirm." },
        needsApproval: { label: "Needs approval", detail: "Over your {limit} per-load limit, so an approver at your company decides." },
        draft: { label: "Saved as draft", detail: "No market rate yet. Saved with a custom quote request." },
    } satisfies Record<ImportSplit, { label: string; detail: string }>,
    noLimit: "Sent to an approver at your company.",
    loads: { one: "{count} load", other: "{count} loads" },
    total: "Batch total",
    totalNote: "Linehaul for priced rows, before fuel and accessorials.",
    tender: {
        legend: "Who gets offered these loads",
        options: [
            { value: "openMarket", label: "Open market", detail: "Every eligible carrier sees the loads at once." },
            { value: "waterfall", label: "Preferred carriers", detail: "Offered to your preferred carriers on each lane in turn, 15 minutes each." },
            { value: "both", label: "Preferred, then open market", detail: "Preferred carriers first, then every eligible carrier if nobody books." },
        ] satisfies ChoiceOption<ImportTenderDto["strategy"]>[],
    },
    mode: {
        legend: "How carriers respond",
        options: [
            { value: "bookNow", label: "Book now", detail: "The first carrier to accept books at the quoted price." },
            { value: "bid", label: "Take bids", detail: "Carriers bid and you choose who books." },
        ] satisfies ChoiceOption<ImportTenderDto["mode"]>[],
    },
    edit: "Edit rows",
    create: { one: "Create {count} load", other: "Create {count} loads" },
    nothing: "No rows are left to create.",
    confirm: {
        title: "Create these loads?",
        consequence: "{postNow} go to carriers now, {needsApproval} go to an approver and {draft} are saved as drafts. Batch total {total}.",
        label: "Create loads",
        cancel: "Keep reviewing",
    },
    result: {
        label: "Import complete",
        lead: "Every row of {file} has an outcome in the results file.",
        outcomes: { posted: "Posted", pendingApproval: "With an approver", draft: "Saved as drafts", rejected: "Not imported" },
        download: "Download results",
        loads: "View these loads",
    },
} as const;
