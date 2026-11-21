import { nanoid } from "nanoid";
import { TIME_MS } from "@/lib/constants";
import type { ChargeDto, DraftFreightDto, LoadQuoteDto } from "@/lib/contract/schemas";
import { MOCK_FACILITIES } from "@/lib/data/mocks/facilities";
import { MOCK_SPEND_LIMITS } from "@/lib/data/mocks/imports";
import { MOCK_FREIGHT } from "@/lib/data/mocks/loads";
import { MOCK_POSTING } from "@/lib/data/mocks/posting";
import { MOCK_PRICING } from "@/lib/data/mocks/pricing";
import { CURRENCY } from "@/lib/loads/constants";
import type { MockCaller } from "@/lib/mocks/freight-access";
import { approversFor, iso } from "@/lib/mocks/posting-store";
import type { MockLoad, QuoteConfidence } from "@/lib/types";
import { milesApart } from "@/lib/utils/geo";

const CENTS = 100;

const pointOf = (facility: string): [number, number] => [MOCK_FACILITIES[facility].longitude, MOCK_FACILITIES[facility].latitude];

export const laneMiles = (load: MockLoad) =>
    load.stops.reduce((total, stop, index) => (index === 0 ? 0 : total + milesApart(pointOf(load.stops[index - 1].facility), pointOf(stop.facility))), 0) *
    MOCK_PRICING.roadFactor;

const confidenceOf = (miles: number): QuoteConfidence => {
    if (miles <= MOCK_POSTING.confidenceMiles.high) return "high";
    return miles <= MOCK_POSTING.confidenceMiles.medium ? "medium" : "low";
};

const charge = (kind: ChargeDto["kind"], amountCents: number): ChargeDto => ({ kind, amountCents, status: "agreed" });

const extrasCents = ({ requirements, hazmat }: DraftFreightDto) =>
    requirements.reduce((sum, requirement) => sum + MOCK_POSTING.surchargeCents[requirement], hazmat ? MOCK_POSTING.hazmatCents : 0);

export const priceDraft = (load: MockLoad, freight: DraftFreightDto, caller: MockCaller, now: number): LoadQuoteDto | null => {
    const miles = laneMiles(load);
    if (miles > MOCK_POSTING.unpricedMiles) return null;

    const linehaul = Math.round((MOCK_PRICING.perMile[freight.equipment] * miles) / MOCK_PRICING.roundTo) * MOCK_PRICING.roundTo * CENTS;
    const extras = extrasCents(freight);
    const parts = [charge("linehaul", linehaul), charge("fuel", Math.round(linehaul * MOCK_FREIGHT.fuelShare)), ...(extras > 0 ? [charge("accessorial", extras)] : [])];
    const totalCents = parts.reduce((sum, part) => sum + part.amountCents, 0);
    const limit = MOCK_SPEND_LIMITS[caller.user.email] ?? null;
    const required = limit !== null && totalCents > limit;

    return {
        id: `qt_${nanoid()}`,
        price: { totalCents, currency: CURRENCY, pending: false, parts },
        miles: Math.round(miles),
        confidence: confidenceOf(miles),
        validUntil: iso(now + MOCK_POSTING.quoteMinutes * TIME_MS.minute),
        approval: { required, limitCents: limit, approvers: required && caller.organisation ? approversFor(caller.organisation, caller.user.email) : [] },
    };
};

export const quoteBurst = (stamps: readonly number[], now: number) => {
    const recent = stamps.filter((stamp) => now - stamp < MOCK_POSTING.quoteBurst.windowMs);
    return { recent: [...recent, now], limited: recent.length >= MOCK_POSTING.quoteBurst.count };
};
