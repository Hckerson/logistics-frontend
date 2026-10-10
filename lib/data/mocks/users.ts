import type { MockScenario, MockUser } from "@/lib/types";

export const MOCK_USERS: readonly MockUser[] = [
    {
        id: "usr_dispatch",
        name: "Dana Okafor",
        email: "dispatch@northline.example",
        password: "hunter22",
        role: "USER",
        verified: true,
        mfa: false,
    },
    {
        id: "usr_fresh",
        name: "Kofi Mensah",
        email: "fresh@northline.example",
        password: "hunter22",
        role: "USER",
        verified: false,
        mfa: false,
    },
    {
        id: "usr_approver",
        name: "Mara Lindqvist",
        email: "approver@northline.example",
        password: "hunter22",
        role: "USER",
        verified: true,
        mfa: true,
    },
];

export const MOCK_SCENARIOS: Record<string, MockScenario> = {
    "busy@haulr.test": { kind: "rate-limited", retryAfter: 120 },
    "down@haulr.test": { kind: "unavailable" },
};

export const MOCK_RESET_TOKENS: Record<string, string> = {
    rst_dispatch: "dispatch@northline.example",
    rst_busy: "busy@haulr.test",
    rst_down: "down@haulr.test",
};

export const MOCK_OUTAGE_TOKENS: readonly string[] = ["rst_outage"];

export const MOCK_VERIFY_TOKENS: Record<string, string> = {
    vrf_fresh: "fresh@northline.example",
    vrf_dispatch: "dispatch@northline.example",
    vrf_busy: "busy@haulr.test",
    vrf_down: "down@haulr.test",
};

export const MOCK_BREACHED_PASSWORDS: readonly string[] = ["password", "password1", "12345678", "qwerty123", "iloveyou"];
