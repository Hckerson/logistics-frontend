export const TICKET_CATEGORIES = ["account", "loads", "billing", "claims", "technical", "other"] as const;

export const TICKET_URGENCIES = ["urgent", "high", "normal"] as const;

export const TICKET_STATUSES = ["open", "waiting", "resolved"] as const;

export const TICKET_LIMITS = { subject: 120, description: 4000, load: 32 } as const;

export const TICKET_DRAFT = { key: "haulr.support.draft", maxAgeDays: 30 } as const;

export const TICKET_REFERENCE_PREFIX = "TKT-";
