import { MOCK_FACILITIES } from "@/lib/data/mocks/facilities";
import type { Equipment, LoadStatus, MockLoadSpec } from "@/lib/types";

const HISTORY = {
    count: 140,
    firstAgeHours: 72,
    spacingHours: 20,
    pickupLagHours: 4,
    transitHours: 26,
    seed: 7919,
    alphabet: "23456789ABCDEFGHJKLMNPQRSTUVWXYZ",
    idLength: 8,
    basePriceCents: 82000,
    priceStepCents: 3700,
    priceSpread: 11,
    payShare: 0.85,
    baseWeightLb: 22000,
    weightStepLb: 1300,
    weightSpread: 15,
} as const;

const STATUSES: readonly LoadStatus[] = ["Closed", "Paid", "Paid", "Invoiced", "PodVerified", "Delivered", "Closed", "Paid", "Cancelled", "Paid"];
const EQUIPMENT: readonly Equipment[] = ["dry-van", "dry-van", "reefer", "flatbed"];
const CARRIERS = ["ridgeway", "blueMesa", "granite"] as const;
const COMMODITIES = ["Packaged beverages", "Paper goods", "Auto parts", "Housewares", "Frozen foods", "Building materials", "Electronics", "Pet food"];
const FACILITIES = Object.keys(MOCK_FACILITIES).filter((key) => MOCK_FACILITIES[key].organisation === "northline");

const idOf = (index: number) => {
    let value = (index + 1) * HISTORY.seed;
    let id = "";
    for (let position = 0; position < HISTORY.idLength; position += 1) {
        id += HISTORY.alphabet[value % HISTORY.alphabet.length];
        value = Math.floor(value / HISTORY.alphabet.length) + (position + index) * HISTORY.seed;
    }
    return `HL-${id}`;
};

const specOf = (index: number): MockLoadSpec => {
    const status = STATUSES[index % STATUSES.length];
    const age = HISTORY.firstAgeHours + index * HISTORY.spacingHours;
    const origin = FACILITIES[index % FACILITIES.length];
    const destination = FACILITIES[(index * 7 + 3) % FACILITIES.length] === origin ? FACILITIES[(index + 1) % FACILITIES.length] : FACILITIES[(index * 7 + 3) % FACILITIES.length];
    const cancelled = status === "Cancelled";
    const pickupAt = age - HISTORY.pickupLagHours;
    const deliveryAt = pickupAt - HISTORY.transitHours;
    const priceCents = HISTORY.basePriceCents + (index % HISTORY.priceSpread) * HISTORY.priceStepCents;

    return {
        shipper: "northline",
        carrier: cancelled ? undefined : CARRIERS[index % CARRIERS.length],
        id: idOf(index),
        status,
        equipment: EQUIPMENT[index % EQUIPMENT.length],
        commodity: COMMODITIES[index % COMMODITIES.length],
        weightLb: HISTORY.baseWeightLb + (index % HISTORY.weightSpread) * HISTORY.weightStepLb,
        priceCents,
        payCents: cancelled ? 0 : Math.round(priceCents * HISTORY.payShare),
        ageHours: age,
        stops: [
            { facility: origin, type: "pickup", opensIn: -pickupAt, ...(cancelled ? {} : { arrived: pickupAt, departed: pickupAt - 1 }) },
            { facility: destination, type: "delivery", opensIn: -deliveryAt, ...(cancelled ? {} : { arrived: deliveryAt, departed: deliveryAt - 1 }) },
        ],
    };
};

export const MOCK_LOAD_HISTORY: readonly MockLoadSpec[] = Array.from({ length: HISTORY.count }, (_, index) => specOf(index));
