import type { StandingBlockerDto } from "@/lib/contract/schemas";
import type { StandingCapability, StandingFix } from "@/lib/types";

export const STANDING_COPY = {
    region: "Account standing for {organisation}",
    dismiss: "Dismiss until you sign out",
    dismissed: "Notice dismissed until you sign out.",
    capabilities: { book: "booking", bid: "bidding", post: "posting loads", pay: "paying invoices" } satisfies Record<StandingCapability, string>,
    and: " and ",
    blocking: "{organisation} can't use {capabilities} until this is fixed.",
    warningOn: "{capabilities} stop on {date} unless this is fixed.",
    warning: "{capabilities} may be refused until this is fixed.",
    severity: { blocking: "Blocking", warning: "Warning" } satisfies Record<StandingBlockerDto["severity"], string>,
    types: {
        onboardingIncomplete: { title: "Onboarding isn't finished", fix: "Finish onboarding" },
        complianceHold: { title: "Compliance review in progress", fix: "Send compliance what the review asks for" },
        insuranceExpiring: { title: "Insurance certificate expiring", fix: "Upload a current insurance certificate" },
        insuranceLapsed: { title: "Insurance certificate expired", fix: "Upload a current insurance certificate" },
        authorityInactive: { title: "Operating authority inactive", fix: "Update your operating authority" },
        paymentMethodMissing: { title: "No payment method on file", fix: "Add a payment method" },
        paymentMethodFailed: { title: "A saved payment method failed", fix: "Update the failed payment method" },
        creditLimitReached: { title: "Credit limit reached", fix: "Review billing and credit" },
        payoutMethodFailed: { title: "Payout method failed", fix: "Update your payout method" },
    } satisfies Record<StandingBlockerDto["type"], { title: string; fix: string }>,
    where: {
        shipperOnboarding: "in shipper onboarding",
        carrierOnboarding: "in carrier onboarding",
        billing: "in billing settings",
        compliance: "with Haulr compliance",
    } satisfies Record<StandingFix, string>,
    fixText: "{fix} {where}.",
} as const;
