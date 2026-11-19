import type { MockImportPlan, MockImportSample } from "@/lib/types";

const reefer = (min: number, max: number) => ({ tempMinF: String(min), tempMaxF: String(max) });

const WEEKLY: readonly MockImportSample[] = [
    { reference: "WK-1001", from: "chi", to: "dal", inDays: 2, days: 2, equipment: "Dry van", commodity: "Packaged snacks", weight: "38000" },
    { reference: "WK-1002", from: "dal", to: "hou", inDays: 2, days: 1, equipment: "Dry van", commodity: "Paper goods", weight: "24000" },
    { reference: "WK-1003", from: "atl", to: "mia", inDays: 3, days: 1, equipment: "Reefer", commodity: "Fresh produce", weight: "36000", extra: reefer(34, 38) },
    { reference: "WK-1004", from: "lax", to: "phx", inDays: 3, days: 1, equipment: "Reefer", commodity: "Dairy", weight: "30000", extra: reefer(33, 36) },
    { reference: "WK-1005", from: "den", to: "slc", inDays: 4, days: 1, equipment: "Flatbed", commodity: "Steel coil", weight: "42000" },
    { reference: "WK-1006", from: "ind", to: "det", inDays: 4, days: 1, equipment: "Dry van", commodity: "Auto parts", weight: "31000" },
    { reference: "WK-1007", from: "nyc", to: "bos", inDays: 2, days: 1, equipment: "Dry van", commodity: "Beverages", weight: "40000" },
    { reference: "WK-1008", from: "phl", to: "pit", inDays: 3, days: 1, equipment: "Dry van", commodity: "Household goods", weight: "22000" },
    { reference: "WK-1009", from: "kci", to: "oma", inDays: 5, days: 1, equipment: "Dry van", commodity: "Grain bags", weight: "41000" },
    { reference: "WK-1010", from: "mem", to: "nsh", inDays: 5, days: 1, equipment: "Reefer", commodity: "Frozen meals", weight: "35000", extra: reefer(-10, 0) },
    { reference: "WK-1011", from: "stl", to: "chi", inDays: 6, days: 1, equipment: "Dry van", commodity: "Packaging", weight: "18000" },
    { reference: "WK-1012", from: "oak", to: "las", inDays: 6, days: 2, equipment: "Dry van", commodity: "Electronics", weight: "16000" },
    { reference: "WK-1013", from: "sea", to: "pdx", inDays: 7, days: 1, equipment: "Reefer", commodity: "Seafood", weight: "28000", extra: reefer(30, 34) },
    { reference: "WK-1014", from: "hou", to: "nol", inDays: 7, days: 1, equipment: "Dry van", commodity: "Cleaning supplies", weight: "39000" },
    { reference: "WK-1015", from: "chi", to: "lax", inDays: 8, days: 4, equipment: "Flatbed", commodity: "Machinery", weight: "40000" },
    { reference: "WK-1016", from: "atl", to: "lax", inDays: 8, days: 4, equipment: "Flatbed", commodity: "Building panels", weight: "38000" },
    { reference: "WK-1017", from: "sea", to: "mia", inDays: 9, days: 5, equipment: "Dry van", commodity: "Furniture", weight: "30000" },
    { reference: "WK-1018", from: "dal", to: "atl", inDays: 9, days: 2, equipment: "Dry van", commodity: "Retail fixtures", weight: "26000" },
    { reference: "WK-1019", from: "det", to: "ind", inDays: 10, days: 1, equipment: "Dry van", commodity: "Auto parts", weight: "33000" },
    { reference: "WK-1020", from: "bos", to: "nyc", inDays: 10, days: 1, equipment: "Reefer", commodity: "Seafood", weight: "27000", extra: reefer(30, 34) },
];

const MESSY: readonly MockImportSample[] = [
    { reference: "SO-2201", from: "chi", to: "dal", inDays: 2, days: 2, equipment: "53' Dry Van", commodity: "Snacks", weight: "38,500" },
    { reference: "SO-2202", from: "Fresno Packing", to: "phx", inDays: 3, days: 1, equipment: "Reefer", commodity: "Produce", weight: "30000", extra: reefer(34, 38) },
    { reference: "SO-2203", from: "atl", to: "mia", inDays: 3, days: 1, equipment: "Reefer", commodity: "Produce", weight: "32000" },
    { reference: "SO-2204", from: "den", to: "slc", inDays: 4, days: 1, equipment: "Flatbed", commodity: "Steel", weight: "52,000" },
    { reference: "SO-2205", from: "kci", to: "oma", inDays: 4, days: 1, equipment: "Van", commodity: "Grain", weight: "44000" },
    { reference: "SO-2206", from: "ind", to: "det", inDays: -3, days: 1, equipment: "Van", commodity: "Auto parts", weight: "31000" },
    { reference: "SO-2207", from: "hou", to: "nol", inDays: 5, days: -1, equipment: "Van", commodity: "Cleaning supplies", weight: "39000" },
    { reference: "SO-2201", from: "chi", to: "dal", inDays: 2, days: 2, equipment: "Van", commodity: "Snacks", weight: "38000" },
    { reference: "SO-2209", from: "phl", to: "pit", inDays: 4, days: 1, equipment: "Box truck", commodity: "Household goods", weight: "22000" },
    { reference: "SO-2210", from: "nyc", to: "bos", inDays: 4, days: 1, equipment: "Van", commodity: "Beverages", weight: "40000", extra: { pickupDate: "11/31/2026" } },
    { reference: "SO-2211", from: "stl", to: "chi", inDays: 0, days: 1, equipment: "Van", commodity: "Packaging", weight: "18000" },
    { reference: "SO-2212", from: "sea", to: "mia", inDays: 6, days: 5, equipment: "Van", commodity: "Furniture", weight: "30000" },
    { reference: "SO-2213", from: "chi", to: "lax", inDays: 7, days: 4, equipment: "Flatbed", commodity: "Machinery", weight: "40000" },
    { reference: "SO-2214", from: "dal", to: "hou", inDays: 5, days: 1, equipment: "Van", commodity: "Paper", weight: "24000", extra: { hazmat: "maybe" } },
];

const MESSY_COLUMNS = [
    ["Order No", "reference"],
    ["Ship From", "pickupFacility"],
    ["Ship To", "deliveryFacility"],
    ["Ship Date", "pickupDate"],
    ["Due Date", "deliveryDate"],
    ["Trailer", "equipment"],
    ["Description", "commodity"],
    ["Gross Weight", "weightLb"],
    ["Min Temp", "tempMinF"],
    ["Max Temp", "tempMaxF"],
    ["Hazardous", "hazmat"],
    ["Cost Center", null],
    ["Notes", "instructions"],
] as const;

const weekly: MockImportPlan = { columns: "template", style: "name", rows: WEEKLY };

export const MOCK_IMPORT_PLANS: Record<string, MockImportPlan> = {
    "weekly-plan.csv": weekly,
    "messy-plan.csv": { columns: MESSY_COLUMNS, style: "city", rows: MESSY, duplicateStop: "PU-45102" },
    "weekly-plan-pricing-down.csv": weekly,
    "too-many-rows.csv": { ...weekly, repeat: 26 },
    "no-header.csv": { ...weekly, header: false },
    "busy.csv": weekly,
    "down.csv": weekly,
};
