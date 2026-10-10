import type { MockTicket } from "@/lib/types";

export const MOCK_TICKETS: readonly MockTicket[] = [
    {
        reference: "TKT-4H2K9Q",
        key: "seed-detention",
        owner: "dispatch@northline.example",
        subject: "Detention missing from HL-48213 invoice",
        category: "billing",
        urgency: "normal",
        status: "waiting",
        updated: "2026-10-07T15:20:00.000Z",
    },
    {
        reference: "TKT-7M3P1X",
        key: "seed-departed",
        owner: "dispatch@northline.example",
        subject: "Driver app stuck on Departed at Memphis",
        category: "technical",
        urgency: "high",
        status: "resolved",
        updated: "2026-09-30T09:05:00.000Z",
    },
];
