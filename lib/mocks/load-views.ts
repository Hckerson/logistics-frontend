import { can } from "@/lib/auth/capabilities";
import { MOCK_FACILITIES } from "@/lib/data/mocks/facilities";
import { MOCK_ORGANISATIONS } from "@/lib/data/mocks/team";
import { CURRENCY, SUBTRACTIVE_CHARGES } from "@/lib/loads/constants";
import { etaOf, latestPosition } from "@/lib/mocks/fleet";
import type { MockCaller } from "@/lib/mocks/freight-access";
import type { LoadDto, LoadSummaryDto } from "@/lib/contract/schemas";
import type { ChargeParty, MockCharge, MockLoad, MockStop } from "@/lib/types";

const partyOf = (key: string) => ({ id: key, name: MOCK_ORGANISATIONS[key].name });

const placeOf = (facility: string) => {
    const { name, line1, city, region, postalCode, latitude, longitude, timeZone } = MOCK_FACILITIES[facility];
    return { name, line1, city, region, postalCode, latitude, longitude, timeZone };
};

const moneyOf = (charges: readonly MockCharge[], party: ChargeParty) => {
    const parts = charges.filter((charge) => charge.party === party).map(({ kind, amountCents, status }) => ({ kind, amountCents, status }));
    return {
        totalCents: parts.reduce((total, part) => total + (SUBTRACTIVE_CHARGES.includes(part.kind) ? -part.amountCents : part.amountCents), 0),
        currency: CURRENCY,
        pending: parts.some((part) => part.status !== "agreed"),
        parts,
    };
};

const cityOf = ({ type, windowStart, windowEnd, facility }: MockStop) => {
    const { city, region, timeZone } = MOCK_FACILITIES[facility];
    return { type, windowStart, windowEnd, city, region, timeZone };
};

export const toLoadDetail = (load: MockLoad, { user }: MockCaller, now: number): LoadDto => ({
    id: load.id,
    status: load.status,
    version: load.version,
    equipment: load.equipment,
    commodity: load.commodity,
    weightLb: load.weightLb,
    pallets: load.pallets,
    tempMinF: load.tempMinF,
    tempMaxF: load.tempMaxF,
    hazmat: load.hazmat,
    poNumber: load.poNumber,
    bolNumber: load.bolNumber,
    shipper: partyOf(load.shipper),
    carrier: load.carrier ? partyOf(load.carrier) : null,
    eta: etaOf(load, now),
    stops: load.stops.map(({ facility, ...stop }) => ({ ...stop, facility: placeOf(facility) })),
    shipperPrice: can(user.roles, "viewShipperPrice") ? moneyOf(load.charges, "shipper") : null,
    carrierPay: can(user.roles, "viewCarrierPay") ? moneyOf(load.charges, "carrier") : null,
    createdAt: load.createdAt,
    updatedAt: load.updatedAt,
});

export const toLoadSummary = (load: MockLoad, now: number): LoadSummaryDto => {
    const latest = latestPosition(load, now);
    return {
        id: load.id,
        status: load.status,
        equipment: load.equipment,
        shipper: partyOf(load.shipper),
        carrier: load.carrier ? partyOf(load.carrier) : null,
        origin: cityOf(load.stops[0]),
        destination: cityOf(load.stops[load.stops.length - 1]),
        eta: etaOf(load, now),
        lastPositionAt: latest?.recordedAt ?? null,
        lastPositionCity: latest?.city ?? null,
        updatedAt: load.updatedAt,
    };
};
