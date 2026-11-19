import type { ImportField, ImportFieldSpec } from "@/lib/types";

export const IMPORT_FIELD_SPECS = {
    reference: { label: "Reference", description: "Your shipment or order number. With the pickup date it must be unique.", example: "SO-20418" },
    pickupFacility: { label: "Pickup facility", description: "Facility name, code or city and state, matched to your saved facilities.", example: "Northline DC Chicago" },
    pickupDate: { label: "Pickup date", description: "Year-month-day or month/day/year, today or within 90 days.", example: "2026-11-24" },
    pickupTime: { label: "Pickup time", description: "Start of the pickup window in the facility's local time. Defaults to 08:00.", example: "07:30" },
    deliveryFacility: { label: "Delivery facility", description: "Facility name, code or city and state, matched to your saved facilities.", example: "Northline Dallas Crossdock" },
    deliveryDate: { label: "Delivery date", description: "On or after the pickup date.", example: "2026-11-26" },
    deliveryTime: { label: "Delivery time", description: "Start of the delivery window in the facility's local time. Defaults to 08:00.", example: "14:00" },
    equipment: { label: "Equipment", description: "Dry van, reefer or flatbed.", example: "Dry van" },
    commodity: { label: "Commodity", description: "What the load carries.", example: "Packaged snacks" },
    weightLb: { label: "Weight (lb)", description: "Gross weight in pounds, up to 45,000.", example: "38000" },
    pallets: { label: "Pallets", description: "Number of pallets, if palletised.", example: "22" },
    tempMinF: { label: "Min temp (°F)", description: "Required for reefer loads.", example: "34" },
    tempMaxF: { label: "Max temp (°F)", description: "Required for reefer loads; at or above the minimum.", example: "38" },
    hazmat: { label: "Hazmat", description: "Yes or no. Defaults to no.", example: "No" },
    poNumber: { label: "PO number", description: "Purchase order shown to the carrier.", example: "PO-77120" },
    instructions: { label: "Instructions", description: "Pickup instructions for the driver.", example: "Check in at gate 3" },
} as const satisfies Record<ImportField, ImportFieldSpec>;
