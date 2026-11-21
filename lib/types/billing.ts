import type { InvoiceDto, StandingBlockerDto } from "@/lib/contract/schemas";

export type StandingCapability = StandingBlockerDto["capabilities"][number];
export type StandingFix = NonNullable<StandingBlockerDto["fix"]>;
export type InvoiceStatus = InvoiceDto["status"];

export interface MockStandingSeed extends Pick<StandingBlockerDto, "type" | "severity" | "capabilities" | "fix"> {
    inDays?: number;
}

export interface MockPaymentMethod {
    id: string;
    organisation: string;
    type: "ach" | "card";
    label: string;
    last4: string;
    brand: string | null;
    status: "verified" | "pendingVerification" | "failed";
    isDefault: boolean;
    outage?: boolean;
}

export interface MockInvoicePayment {
    id: string;
    reference: string;
    invoiceIds: string[];
    amounts: Record<string, number>;
    methodId: string;
    methodLabel: string;
    methodType: "ach" | "card";
    paidAt: number;
    paidByName: string;
    idempotencyKey: string | null;
}
