import type { LegalDocument, LegalDocumentKey } from "@/lib/types";
import { CARRIER_AGREEMENT } from "@/lib/data/legal/carrier-agreement";
import { PRIVACY } from "@/lib/data/legal/privacy";
import { SHIPPER_TERMS } from "@/lib/data/legal/shipper-terms";
import { TERMS } from "@/lib/data/legal/terms";

export const LEGAL_LIBRARY: Record<LegalDocumentKey, LegalDocument> = {
    terms: TERMS,
    privacy: PRIVACY,
    "shipper-terms": SHIPPER_TERMS,
    "carrier-agreement": CARRIER_AGREEMENT,
};

export const LEGAL_VERSIONS = {
    terms: TERMS.versions[0].version,
    privacy: PRIVACY.versions[0].version,
    "shipper-terms": SHIPPER_TERMS.versions[0].version,
    "carrier-agreement": CARRIER_AGREEMENT.versions[0].version,
} satisfies Record<LegalDocumentKey, string>;
