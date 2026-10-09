import type { MockScenario, MockUser } from "@/lib/types";

export const MOCK_USERS: readonly MockUser[] = [
    {
        id: "usr_dispatch",
        name: "Dana Okafor",
        email: "dispatch@northline.example",
        password: "hunter22",
        role: "USER",
    },
];

export const MOCK_SCENARIOS: Record<string, MockScenario> = {
    "busy@haulr.test": { kind: "rate-limited", retryAfter: 120 },
    "down@haulr.test": { kind: "unavailable" },
};
