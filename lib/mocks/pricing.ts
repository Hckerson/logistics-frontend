import { format, subDays } from "date-fns";
import { nanoid } from "nanoid";
import { DATE_VALUE_FORMAT } from "@/lib/constants";
import { MOCK_PRICING, MOCK_PRICING_SCENARIOS } from "@/lib/data/mocks/pricing";
import { hubNamed, milesBetween } from "@/lib/home/quote-map";
import { fail, ok, playScenario } from "@/lib/mocks/http";
import { mockStore } from "@/lib/mocks/store";
import { UNRESOLVED_LOCATION } from "@/lib/quotes/constants";
import type { Confidence, LaneQuery, MockHandler, MockResponse } from "@/lib/types";
import { laneQuerySchema, saveEstimateSchema } from "@/lib/validations/lane";

const INVALID = "Validation failed";
const SAME_PLACE = "Origin and destination are the same place";
const WEEKEND = [0, 6];
const MAJORS: readonly Confidence[] = ["low", "medium", "high"];

const queryOf = (path: string) => Object.fromEntries(new URL(path, "http://mock.local").searchParams);

const unit = (text: string) => ([...text].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % 997, 7) / 997) * 2 - 1;

const nearest = (value: number) => Math.round(value / MOCK_PRICING.roundTo) * MOCK_PRICING.roundTo;

type Quote = Exclude<ReturnType<typeof quoteFor>, string | null>;

function priced(lane: LaneQuery, path: string): MockResponse | { quote: Quote } {
    const blocked = playScenario(MOCK_PRICING_SCENARIOS[lane.origin.toLowerCase()], path);
    if (blocked) return blocked;
    const quote = quoteFor(lane);
    if (quote === "origin" || quote === "destination") return fail(422, UNRESOLVED_LOCATION[quote], path);
    if (quote === null) return fail(400, SAME_PLACE, path);
    return { quote };
}

function quoteFor(lane: LaneQuery) {
    const from = hubNamed(lane.origin);
    const to = hubNamed(lane.destination);
    if (!from) return "origin";
    if (!to) return "destination";
    if (from === to) return null;
    const confidence = MAJORS[Number(from.major) + Number(to.major)];
    const weekend = WEEKEND.includes(new Date(`${lane.date}T12:00:00`).getDay()) ? MOCK_PRICING.weekend : 1;
    const perMile = MOCK_PRICING.perMile[lane.equipment] * (1 + unit(from.code + to.code) * MOCK_PRICING.wobble) * weekend;
    const miles = Math.round(milesBetween({ from, to }) * MOCK_PRICING.roadFactor);
    return { from, to, confidence, perMile, miles };
}

export const estimate: MockHandler = ({ path }) => {
    const input = laneQuerySchema.safeParse(queryOf(path));
    if (!input.success) return fail(400, INVALID, path);
    const result = priced(input.data, path);
    if ("status" in result) return result;
    const { from, to, confidence, perMile, miles } = result.quote;
    const rate = nearest(perMile * miles);
    const spread = MOCK_PRICING.spread[confidence];
    return ok(200, {
        origin: { code: from.code, name: from.name },
        destination: { code: to.code, name: to.name },
        miles,
        rate,
        low: nearest(rate * (1 - spread)),
        high: nearest(rate * (1 + spread)),
        perMile: Math.round((rate / miles) * 100) / 100,
        confidence,
        samples: MOCK_PRICING.samples[confidence],
    });
};

export const trend: MockHandler = ({ path }) => {
    const input = laneQuerySchema.safeParse(queryOf(path));
    if (!input.success) return fail(400, INVALID, path);
    const result = priced(input.data, path);
    if ("status" in result) return result;
    const { confidence, perMile, from, to } = result.quote;
    const { days, thinDays, drift, swing, wave, dailyShare, jitter } = MOCK_PRICING.trend;
    const span = confidence === "low" ? thinDays : days;
    const slope = unit(to.code + from.code) * drift;
    return ok(
        200,
        Array.from({ length: span }, (_, index) => {
            const back = span - 1 - index;
            return {
                date: format(subDays(new Date(), back), DATE_VALUE_FORMAT),
                perMile: Math.round(perMile * (1 - slope * back + Math.sin(index * wave) * swing) * 100) / 100,
                samples: Math.max(1, Math.round(MOCK_PRICING.samples[confidence] / dailyShare + Math.cos(index) * jitter)),
            };
        }),
    );
};

export const saveEstimate: MockHandler = ({ body, path }) => {
    const input = saveEstimateSchema.safeParse(body);
    if (!input.success) return fail(400, INVALID, path);
    const id = nanoid();
    mockStore().savedEstimates.set(id, { id, owner: input.data.email.toLowerCase(), lane: input.data.lane, rate: input.data.rate, saved: new Date().toISOString() });
    return ok(201, { id });
};
