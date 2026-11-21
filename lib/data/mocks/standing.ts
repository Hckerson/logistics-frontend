import type { MockStandingSeed } from "@/lib/types";

export const MOCK_STANDING: Partial<Record<string, readonly MockStandingSeed[]>> = {
    blueMesa: [{ type: "complianceHold", severity: "blocking", capabilities: ["book", "bid"], fix: "carrierOnboarding" }],
    ridgeway: [{ type: "insuranceExpiring", severity: "warning", capabilities: ["book", "bid"], fix: "carrierOnboarding", inDays: 9 }],
    northline: [{ type: "paymentMethodFailed", severity: "warning", capabilities: ["pay"], fix: "billing" }],
};
