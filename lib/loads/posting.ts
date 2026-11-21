import { nanoid } from "nanoid";
import type { DraftFreightDto, DraftStopDto, LoadDraftDto } from "@/lib/contract/schemas";
import { STOP_INSTRUCTIONS } from "@/lib/loads/constants";
import { BOOKING_HORIZON_DAYS, WINDOW_MINUTES } from "@/lib/ui/constants";
import type { FreightEntries, LaneEntries, PostDraft, PostStep, Requirement, StopEntry, StopType } from "@/lib/types";

export const POST_STEPS = ["lane", "freight", "quote", "review"] as const satisfies readonly PostStep[];

export const POST_PARAMS = { step: "step", lane: "lane", from: "from", draft: "draft" } as const;

export const REQUIREMENTS = ["team", "liftgate", "tarps", "driverAssist"] as const satisfies readonly Requirement[];

export const POSTING = {
    stops: { min: 2, max: 6 },
    weightLb: 45_000,
    pallets: 30,
    tempF: { min: -20, max: 80 },
    commodity: 80,
    reference: 40,
    poNumber: 40,
    instructions: STOP_INSTRUCTIONS.max,
    note: 500,
    windowMinutes: WINDOW_MINUTES,
    horizonDays: BOOKING_HORIZON_DAYS,
    quoteWarnMinutes: [5, 1],
    draftDays: 30,
    storageKey: "haulr.post-load",
    strategy: { market: "openMarket", mode: "bookNow" },
} as const;

export const UN_NUMBER = /^UN\d{4}$/;

export const blankStop = (type: StopType, facilityId: string | null = null): StopEntry => ({
    key: nanoid(),
    type,
    facilityId,
    window: null,
    reference: "",
    instructions: "",
});

export const BLANK_FREIGHT: FreightEntries = {
    equipment: null,
    commodity: "",
    weightLb: "",
    pallets: "",
    tempMinF: "",
    tempMaxF: "",
    hazmat: false,
    unNumber: "",
    requirements: [],
    poNumber: "",
};

export const blankDraft = (lane: LaneEntries = { stops: [blankStop("pickup"), blankStop("delivery")] }, freight = BLANK_FREIGHT): PostDraft => ({
    draftId: null,
    version: 0,
    lane,
    freight,
    quote: null,
    reached: "lane",
    savedAt: 0,
});

const orNull = (text: string) => text.trim() || null;

const numberOrNull = (text: string) => (text.trim() === "" ? null : Number(text));

export const windowsInOrder = (stops: readonly Pick<DraftStopDto, "windowStart" | "windowEnd">[]) =>
    stops.every((stop, index) => index === 0 || Date.parse(stop.windowStart) >= Date.parse(stops[index - 1].windowStart));

export const typesInOrder = (types: readonly StopType[]) => types[0] === "pickup" && types.at(-1) === "delivery";

export const toDraftStops = ({ stops }: LaneEntries): DraftStopDto[] =>
    stops.map(({ type, facilityId, window, reference, instructions }) => ({
        type,
        facilityId: facilityId ?? "",
        windowStart: window?.start ?? "",
        windowEnd: window?.end ?? "",
        reference: orNull(reference),
        instructions: orNull(instructions),
    }));

export const toDraftFreight = (entries: FreightEntries): DraftFreightDto => {
    const reefer = entries.equipment === "reefer";
    return {
        equipment: entries.equipment ?? "dry-van",
        commodity: entries.commodity.trim(),
        weightLb: Number(entries.weightLb),
        pallets: numberOrNull(entries.pallets),
        tempMinF: reefer ? numberOrNull(entries.tempMinF) : null,
        tempMaxF: reefer ? numberOrNull(entries.tempMaxF) : null,
        hazmat: entries.hazmat,
        unNumber: entries.hazmat ? orNull(entries.unNumber.toUpperCase()) : null,
        requirements: entries.requirements,
        poNumber: orNull(entries.poNumber),
    };
};

const text = (value: number | null) => (value === null ? "" : String(value));

export const fromDraftStops = (stops: readonly DraftStopDto[]): LaneEntries => ({
    stops: stops.map((stop) => ({
        key: nanoid(),
        type: stop.type,
        facilityId: stop.facilityId || null,
        window: stop.windowStart && stop.windowEnd ? { start: stop.windowStart, end: stop.windowEnd } : null,
        reference: stop.reference ?? "",
        instructions: stop.instructions ?? "",
    })),
});

export const fromDraftFreight = (freight: DraftFreightDto | null): FreightEntries =>
    freight
        ? {
              ...freight,
              weightLb: text(freight.weightLb),
              pallets: text(freight.pallets),
              tempMinF: text(freight.tempMinF),
              tempMaxF: text(freight.tempMaxF),
              unNumber: freight.unNumber ?? "",
              poNumber: freight.poNumber ?? "",
          }
        : BLANK_FREIGHT;

export const fromServerDraft = (saved: LoadDraftDto, reached: PostStep): PostDraft => ({
    draftId: saved.id,
    version: saved.version,
    lane: fromDraftStops(saved.stops),
    freight: fromDraftFreight(saved.freight),
    quote: saved.quote,
    reached,
    savedAt: Date.parse(saved.updatedAt),
});

export const stepIndex = (step: PostStep) => POST_STEPS.indexOf(step);

export const furthest = (a: PostStep, b: PostStep) => (stepIndex(a) >= stepIndex(b) ? a : b);

export const quoteLive = (draft: PostDraft, now: number) => draft.quote !== null && Date.parse(draft.quote.validUntil) > now;
