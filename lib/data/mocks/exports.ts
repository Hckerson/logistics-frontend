export const MOCK_EXPORTS = {
    instantRows: 100,
    queuedMs: 600,
    quickMs: 900,
    jobMs: 9000,
    concurrent: 3,
    retryAfterSeconds: 30,
    ttlHours: 24,
    downloadMinutes: 5,
    storagePath: "/api/mock-storage/exports",
    fileName: "haulr-loads-{date}.csv",
    columns: ["Load", "Status", "Origin", "Destination", "Pickup window", "Delivery window", "Carrier", "Equipment"],
    messages: {
        missing: "Export not found",
        notReady: "Export is not ready yet",
        expired: "Export expired",
        busy: "Three exports are already running for your organisation",
    },
} as const;
