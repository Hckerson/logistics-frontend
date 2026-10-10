import type { HelpArticle } from "@/lib/types";

export const MONEY_ARTICLES: readonly HelpArticle[] = [
    {
        slug: "read-an-invoice",
        category: "billing",
        title: "Understand your invoice",
        summary: "What each line means and when payment is due.",
        updated: "2026-09-29",
        steps: [
            { id: "lines", title: "Read the lines", body: ["The line haul is the agreed rate. Accessorials such as detention or lumper fees are listed separately with their evidence."] },
            { id: "due", title: "Check the due date", body: ["Payment terms come from the rate confirmation. The due date is shown at the top."] },
            { id: "dispute", title: "Question a charge", body: ["Open the charge and choose Dispute. The invoice stays open while it's reviewed."] },
        ],
        related: ["file-a-claim", "post-a-load"],
    },
    {
        slug: "file-a-claim",
        category: "claims",
        title: "File a cargo claim",
        summary: "Report damage, loss or shortage with the evidence attached.",
        updated: "2026-09-18",
        steps: [
            { id: "start", title: "Start from the load", body: ["Open the delivered load and choose File a claim. Claims must be filed within 9 months of delivery."] },
            { id: "evidence", title: "Attach the evidence", body: ["Add photos, the proof of delivery with exceptions noted, and the value of the goods."] },
            { id: "follow", title: "Follow it through", body: ["Both sides see the same claim record. You're notified at each decision."] },
        ],
        related: ["record-a-stop", "read-an-invoice"],
    },
    {
        slug: "carrier-documents",
        category: "compliance",
        title: "Keep your carrier documents current",
        summary: "Insurance and authority that lapse pause your bookings.",
        updated: "2026-09-26",
        steps: [
            { id: "upload", title: "Upload your documents", body: ["Add your certificate of insurance and operating authority from Compliance."] },
            { id: "watch", title: "Watch the expiry dates", body: ["We remind you 30, 14 and 3 days before anything expires."] },
            { id: "renew", title: "Renew before it lapses", body: ["Bookings pause on the day a document lapses and resume once the new one is checked."] },
        ],
        related: ["book-a-load"],
    },
    {
        slug: "api-access",
        category: "integrations",
        title: "Connect with the Haulr API",
        summary: "Create a key and receive load events in your own systems.",
        updated: "2026-10-01",
        steps: [
            { id: "key", title: "Create an API key", body: ["Admins create keys from Integrations. Each key has its own scopes and can be revoked at any time."] },
            { id: "webhooks", title: "Subscribe to events", body: ["Add a webhook URL to receive load, tracking and invoice events as they happen."] },
            { id: "test", title: "Test in the sandbox", body: ["Sandbox keys work against sample loads, so nothing real is booked."] },
        ],
        related: ["manage-access"],
    },
];
