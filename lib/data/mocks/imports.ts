import type { ImportProblemDto } from "@/lib/contract/schemas";
import type { ImportField, MockScenario } from "@/lib/types";

export const MOCK_IMPORTS = {
    storagePath: "/api/mock-storage/imports",
    filesPath: "/api/mock-storage/import-files",
    linkMinutes: 15,
    timing: {
        parsing: { baseMs: 900, rowMs: 6 },
        validating: { baseMs: 1_200, rowMs: 8 },
        pricing: { baseMs: 1_800, rowMs: 10 },
        confirming: { baseMs: 900, rowMs: 4 },
    },
    pricingDown: "pricing-down",
    defaultTime: "08:00",
    fallbackZone: "America/Chicago",
    windowHours: 2,
    loadIdLength: 8,
    loadIdAlphabet: "23456789ABCDEFGHJKLMNPQRSTUVWXYZ",
    templateFile: "haulr-load-import-template.csv",
    eventNote: "Imported from {file}",
    resultsFile: "{name}-results.csv",
    resultColumns: ["Line", "Reference", "Outcome", "Load", "Price (USD)", "Reasons"],
    resultOutcomes: { Posted: "Posted", PendingApproval: "Pending approval", Draft: "Saved as draft", rejected: "Not imported", excluded: "Excluded" },
    messages: {
        missing: "Import batch not found",
        notUploaded: "The file has not reached storage yet",
        notMapping: "The batch is not waiting for a column mapping",
        unmapped: "Map every required field: {fields}",
        twice: "Each field can be mapped to one column only",
        stale: "The batch changed since you loaded it. Reload to see the latest rows.",
        notEditable: "The batch can no longer be changed",
        invalidIncluded: "Fix or exclude every invalid row first",
        nothingToPrice: "No valid rows are left to price",
        expired: "Quotes expired. Price the batch again.",
        notFinished: "Results are ready once the batch completes",
        rowMissing: "Row not found",
    },
    problems: {
        unreadable: "The file could not be read as CSV or Excel.",
        encoding: "The file is not UTF-8 text. Save it as CSV UTF-8 and upload it again.",
        tooManyRows: "The file has {count} rows. An import takes up to 500, so split it and upload each part.",
        noHeader: "The first row doesn't name any known column. Add a header row; the template shows one.",
        empty: "The file has a header row but no loads.",
    } satisfies Record<ImportProblemDto["code"], string>,
};

export const MOCK_SPEND_LIMITS: Partial<Record<string, number>> = { "dispatch@northline.example": 600_000, "fresh@northline.example": 300_000 };

export const MOCK_IMPORT_ISSUES = {
    required: "{field} is required.",
    format: "{field} \"{value}\" can't be read.",
    past: "Pickup date {value} has already passed.",
    horizon: "Pickup date {value} is more than 90 days out.",
    order: "The delivery date is before the pickup date.",
    facility: "No facility matches \"{value}\". Choose one of your facilities.",
    equipment: "\"{value}\" isn't dry van, reefer or flatbed.",
    weight: "{value} lb is over the 45,000 lb limit.",
    weightNear: "{value} lb is close to the 45,000 lb limit. Check the axle weights.",
    temperature: "Reefer loads need a minimum and a maximum temperature.",
    temperatureOrder: "The minimum temperature is above the maximum.",
    duplicateFile: "Same reference and pickup date as line {value}.",
    duplicateLoad: "Load {value} already has this reference and pickup date.",
    closeToPickup: "Pickup is today, so coverage may be tight.",
    unpriced: "No market rate for this lane yet. It's saved as a draft with a custom quote request.",
    unavailable: "Pricing is unavailable right now. The row is saved as a draft with a custom quote request.",
} as const;

export const MOCK_IMPORT_SCENARIOS: Record<string, MockScenario> = {
    busy: { kind: "rate-limited", retryAfter: 60 },
    down: { kind: "unavailable" },
};

export const MOCK_IMPORT_SYNONYMS: Record<ImportField, readonly string[]> = {
    reference: ["reference", "ref", "orderno", "ordernumber", "shipmentid", "shipmentreference", "loadref", "customerref"],
    pickupFacility: ["pickupfacility", "pickup", "origin", "shipfrom", "originfacility", "from", "pickuplocation"],
    pickupDate: ["pickupdate", "shipdate", "pudate", "readydate", "origindate"],
    pickupTime: ["pickuptime", "putime", "shiptime", "readytime"],
    deliveryFacility: ["deliveryfacility", "delivery", "destination", "shipto", "consignee", "to", "deliverylocation"],
    deliveryDate: ["deliverydate", "duedate", "deldate", "deliverby", "mustdeliverby"],
    deliveryTime: ["deliverytime", "deltime", "appointmenttime"],
    equipment: ["equipment", "equipmenttype", "trailer", "trailertype"],
    commodity: ["commodity", "description", "product", "goods"],
    weightLb: ["weightlb", "weight", "grossweight", "weightlbs", "lbs"],
    pallets: ["pallets", "palletcount", "skids"],
    tempMinF: ["mintempf", "mintemp", "tempmin", "temperaturemin"],
    tempMaxF: ["maxtempf", "maxtemp", "tempmax", "temperaturemax"],
    hazmat: ["hazmat", "hazardous", "dangerousgoods"],
    poNumber: ["ponumber", "po", "purchaseorder"],
    instructions: ["instructions", "notes", "specialinstructions", "comments"],
};

export const MOCK_EQUIPMENT_WORDS = {
    "dry-van": ["dryvan", "van", "53dryvan", "53van", "dv"],
    reefer: ["reefer", "refrigerated", "temperaturecontrolled", "rf"],
    flatbed: ["flatbed", "flat", "fb"],
} as const;

