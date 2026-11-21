import "server-only";
import { z } from "zod";
import type { FlagKey, Flags, FlagSpec } from "@/lib/types";

export const FLAG_KEYS = ["bulkImport", "recurringLoads", "spendApprovals", "amendments", "sso", "scim", "apiKeys", "webhooks", "edi", "reports", "viewAs", "passkeys", "driverServiceWorker"] as const;

export const FLAGS: Record<FlagKey, FlagSpec> = {
    bulkImport: { default: true, owner: "Shipper experience", removeBy: "2027-06-30", purpose: "Bulk load import from CSV or Excel" },
    recurringLoads: { default: false, owner: "Shipper experience", removeBy: "2027-06-30", purpose: "Templates that post loads on a schedule" },
    spendApprovals: { default: false, owner: "Enterprise", removeBy: "2027-06-30", purpose: "Approval routing above a member's spend limit" },
    amendments: { default: false, owner: "Freight operations", removeBy: "2027-06-30", purpose: "Proposed changes to booked loads" },
    sso: { default: false, owner: "Enterprise", removeBy: "2027-09-30", purpose: "Single sign-on" },
    scim: { default: false, owner: "Enterprise", removeBy: "2027-09-30", purpose: "SCIM user provisioning" },
    apiKeys: { default: false, owner: "Platform", removeBy: "2027-09-30", purpose: "Organisation API keys" },
    webhooks: { default: false, owner: "Platform", removeBy: "2027-09-30", purpose: "Outbound webhooks" },
    edi: { default: false, owner: "Platform", removeBy: "2027-12-31", purpose: "EDI tender and status exchange" },
    reports: { default: false, owner: "Shipper experience", removeBy: "2027-06-30", purpose: "Scheduled reports" },
    viewAs: { default: false, owner: "Support", removeBy: "2027-06-30", purpose: "Support view-as sessions" },
    passkeys: { default: false, owner: "Identity", removeBy: "2027-06-30", purpose: "Passkey sign-in" },
    driverServiceWorker: { default: false, owner: "Driver app", removeBy: "2027-06-30", purpose: "Offline driver app shell" },
};

const SWITCH = z.enum(["on", "off"]);

export const flagVariable = (key: FlagKey) => `FLAG_${key.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase()}`;

const read = (key: FlagKey) => {
    const raw = process.env[flagVariable(key)]?.trim();
    if (!raw) return FLAGS[key].default;
    const parsed = SWITCH.safeParse(raw);
    if (!parsed.success) throw new Error(`Invalid environment: ${flagVariable(key)} must be on or off`);
    return parsed.data === "on";
};

export const readFlags = (): Flags => ({
    bulkImport: read("bulkImport"),
    recurringLoads: read("recurringLoads"),
    spendApprovals: read("spendApprovals"),
    amendments: read("amendments"),
    sso: read("sso"),
    scim: read("scim"),
    apiKeys: read("apiKeys"),
    webhooks: read("webhooks"),
    edi: read("edi"),
    reports: read("reports"),
    viewAs: read("viewAs"),
    passkeys: read("passkeys"),
    driverServiceWorker: read("driverServiceWorker"),
});
