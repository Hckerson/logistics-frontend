import type { MockLoadSpec } from "@/lib/types";

export const MOCK_FREIGHT = {
    windowHours: 2,
    fuelShare: 0.18,
    quickPayShare: 0.02,
    reportEveryMinutes: 5,
    progressCap: 0.97,
    scanSeconds: 8,
    uploadHost: "/api/mock-storage",
} as const;

const ridgeway = { carrier: "ridgeway", driver: "usr_driver" } as const;
const northline = { shipper: "northline" } as const;

export const MOCK_LOADS: readonly MockLoadSpec[] = [
    {
        ...northline, ...ridgeway, id: "HL-7K2M9QXA", status: "InTransit", equipment: "dry-van", commodity: "Packaged beverages", weightLb: 41200, pallets: 22, poNumber: "PO-88213", bolNumber: "BOL-55120", priceCents: 241000, payCents: 205000, ageHours: 52,
        stops: [{ facility: "chi", type: "pickup", opensIn: -10, arrived: 10.2, departed: 9 }, { facility: "dal", type: "delivery", opensIn: 10 }],
        track: { mph: 52, source: "eld", confidence: "high" },
    },
    {
        ...northline, ...ridgeway, id: "HL-3RW8TNPE", status: "InTransit", equipment: "reefer", commodity: "Fresh produce", weightLb: 38600, pallets: 20, tempF: [34, 38], poNumber: "PO-88240", priceCents: 128000, payCents: 109000, ageHours: 30,
        stops: [{ facility: "lax", type: "pickup", opensIn: -5, arrived: 5.1, departed: 4 }, { facility: "phx", type: "delivery", opensIn: 2 }],
        track: { mph: 55, silentMinutes: 72, source: "driverApp", confidence: "medium" },
    },
    {
        ...northline, carrier: "blueMesa", id: "HL-9DQ4ZB2M", status: "InTransit", equipment: "dry-van", commodity: "Home goods", weightLb: 33400, pallets: 18, poNumber: "PO-88251", priceCents: 176000, payCents: 151000, pendingCents: 7500, ageHours: 40,
        stops: [{ facility: "atl", type: "pickup", opensIn: -8, arrived: 8, departed: 7 }, { facility: "mia", type: "delivery", opensIn: 4 }],
        track: { mph: 50, silentMinutes: 110, source: "eld", confidence: "low" },
    },
    {
        ...northline, ...ridgeway, id: "HL-5HJ2KX8C", status: "AtPickup", equipment: "flatbed", commodity: "Structural steel", weightLb: 44800, poNumber: "PO-88262", priceCents: 162000, payCents: 139000, ageHours: 26,
        stops: [{ facility: "den", type: "pickup", opensIn: -0.5, arrived: 0.4 }, { facility: "slc", type: "delivery", opensIn: 13 }],
        track: { mph: 50, source: "eld", confidence: "high" },
    },
    {
        ...northline, ...ridgeway, id: "HL-2PV7MW4R", status: "AtDelivery", equipment: "dry-van", commodity: "Canned goods", weightLb: 39900, pallets: 21, bolNumber: "BOL-55188", priceCents: 96000, payCents: 82000, ageHours: 34,
        stops: [{ facility: "hou", type: "pickup", opensIn: -8.5, arrived: 8.4, departed: 7.5 }, { facility: "nol", type: "delivery", opensIn: -1, arrived: 0.6 }],
        track: { mph: 50, source: "eld", confidence: "high" },
    },
    {
        ...northline, ...ridgeway, id: "HL-8TB3QF6N", status: "Dispatched", equipment: "dry-van", commodity: "Paper products", weightLb: 28700, pallets: 24, poNumber: "PO-88277", priceCents: 198000, payCents: 168000, ageHours: 20,
        stops: [{ facility: "dal", type: "pickup", opensIn: 14 }, { facility: "atl", type: "delivery", opensIn: 32 }],
    },
    {
        ...northline, ...ridgeway, id: "HL-4MC9RD7K", status: "InTransit", equipment: "dry-van", commodity: "Retail apparel", weightLb: 22100, pallets: 16, poNumber: "PO-88280", priceCents: 142000, payCents: 121000, ageHours: 36,
        stops: [
            { facility: "chi", type: "pickup", opensIn: -9.5, arrived: 9.6, departed: 9 },
            { facility: "ind", type: "delivery", opensIn: -5, arrived: 5, departed: 4 },
            { facility: "det", type: "delivery", opensIn: 2 },
        ],
        track: { mph: 50, source: "eld", confidence: "medium" },
    },
    {
        ...northline, carrier: "granite", id: "HL-6NX2HV9T", status: "Booked", equipment: "reefer", commodity: "Seafood", weightLb: 30200, pallets: 18, tempF: [28, 32], priceCents: 89000, payCents: 76000, ageHours: 18,
        stops: [{ facility: "sea", type: "pickup", opensIn: 20 }, { facility: "pdx", type: "delivery", opensIn: 26 }],
    },
    {
        ...northline, id: "HL-7QJ5LC3W", status: "Posted", equipment: "dry-van", commodity: "Office furniture", weightLb: 18500, pallets: 14, priceCents: 104000, payCents: 0, ageHours: 6,
        stops: [{ facility: "nyc", type: "pickup", opensIn: 30 }, { facility: "bos", type: "delivery", opensIn: 38 }],
    },
    {
        ...northline, id: "HL-3ZK8PE5D", status: "Draft", equipment: "dry-van", commodity: "Electronics", weightLb: 12400, pallets: 10, priceCents: 97000, payCents: 0, ageHours: 2,
        stops: [{ facility: "phl", type: "pickup", opensIn: 48 }, { facility: "pit", type: "delivery", opensIn: 56 }],
    },
    {
        ...northline, id: "HL-9WF6TA2B", status: "PendingApproval", equipment: "flatbed", commodity: "Farm equipment", weightLb: 36000, priceCents: 83000, payCents: 0, ageHours: 4,
        stops: [{ facility: "kci", type: "pickup", opensIn: 36 }, { facility: "oma", type: "delivery", opensIn: 42 }],
    },
    {
        ...northline, ...ridgeway, id: "HL-2GL4YN7S", status: "Delivered", equipment: "dry-van", commodity: "Small appliances", weightLb: 26800, pallets: 20, bolNumber: "BOL-55102", priceCents: 69000, payCents: 59000, ageHours: 80,
        stops: [{ facility: "mem", type: "pickup", opensIn: -50.5, arrived: 50.5, departed: 50 }, { facility: "nsh", type: "delivery", opensIn: -45, arrived: 45, departed: 44 }],
        track: { mph: 48, source: "eld", confidence: "high" },
    },
    {
        ...northline, ...ridgeway, id: "HL-5RT8VK3M", status: "Invoiced", equipment: "dry-van", commodity: "Packaging film", weightLb: 31500, pallets: 22, priceCents: 74000, payCents: 63000, ageHours: 240,
        stops: [{ facility: "stl", type: "pickup", opensIn: -222, arrived: 222, departed: 221 }, { facility: "chi", type: "delivery", opensIn: -216.5, arrived: 216.5, departed: 216 }],
        track: { mph: 55, source: "eld", confidence: "high" },
    },
    {
        ...northline, id: "HL-8EJ3MC6P", status: "Cancelled", equipment: "dry-van", commodity: "Building materials", weightLb: 40100, priceCents: 112000, payCents: 0, ageHours: 60,
        stops: [{ facility: "oak", type: "pickup", opensIn: 12 }, { facility: "las", type: "delivery", opensIn: 22 }],
    },
    {
        shipper: "harbor", carrier: "granite", id: "HL-4BX7NS9Q", status: "InTransit", equipment: "reefer", commodity: "Frozen meals", weightLb: 37800, pallets: 22, tempF: [-10, 0], priceCents: 131000, payCents: 112000, ageHours: 28,
        stops: [{ facility: "msp", type: "pickup", opensIn: -3.5, arrived: 3.6, departed: 3 }, { facility: "chiHarbor", type: "delivery", opensIn: 6 }],
        track: { mph: 54, source: "eld", confidence: "high" },
    },
];
