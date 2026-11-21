import { parseDateTime, toZoned } from "@internationalized/date";
import type { FacilityOptionDto, LoadDraftDto, LoadDto } from "@/lib/contract/schemas";
import { TIME_MS } from "@/lib/constants";
import { blankDraft, blankStop, BLANK_FREIGHT, fromServerDraft, POST_PARAMS, POST_STEPS, POSTING } from "@/lib/loads/posting";
import type { LaneQuery, PostDraft, PostStart, PostStep, StopEntry } from "@/lib/types";
import { laneQuerySchema } from "@/lib/validations/lane";

type Search = Record<string, string | string[] | undefined>;

const PREFILL_HOUR = "T08:00";

const single = (search: Search, key: string) => {
    const value = search[key];
    return typeof value === "string" && value.trim() ? value.trim() : null;
};

export const postSearchOf = (search: Search) => {
    const step = single(search, POST_PARAMS.step);
    return {
        step: POST_STEPS.find((candidate) => candidate === step) ?? null,
        lane: single(search, POST_PARAMS.lane),
        from: single(search, POST_PARAMS.from),
        draft: single(search, POST_PARAMS.draft),
    };
};

const sameText = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

const facilityFor = (place: string, facilities: readonly FacilityOptionDto[]) =>
    facilities.find((facility) => sameText(`${facility.city}, ${facility.region}`, place) || sameText(facility.city, place.split(",")[0])) ?? null;

const morningOf = (date: string, timeZone: string) => {
    try {
        const opens = toZoned(parseDateTime(`${date}${PREFILL_HOUR}`), timeZone).toDate().getTime();
        return { start: new Date(opens).toISOString(), end: new Date(opens + POSTING.windowMinutes * TIME_MS.minute).toISOString() };
    } catch {
        return null;
    }
};

const pickupOn = (facility: FacilityOptionDto | null, date: string): StopEntry => {
    const stop = blankStop("pickup", facility?.id ?? null);
    const window = facility ? morningOf(date, facility.timeZone) : null;
    return window && Date.parse(window.start) > Date.now() ? { ...stop, window } : stop;
};

export const laneDraft = (raw: string, facilities: readonly FacilityOptionDto[]): PostDraft | null => {
    const lane = laneQuerySchema.safeParse(Object.fromEntries(new URLSearchParams(raw)));
    if (!lane.success) return null;
    const { origin, destination, equipment, date }: LaneQuery = lane.data;
    return blankDraft(
        { stops: [pickupOn(facilityFor(origin, facilities), date), blankStop("delivery", facilityFor(destination, facilities)?.id ?? null)] },
        { ...BLANK_FREIGHT, equipment },
    );
};

const facilityOfStop = (stop: LoadDto["stops"][number], facilities: readonly FacilityOptionDto[]) =>
    facilities.find((facility) => facility.name === stop.facility.name && facility.city === stop.facility.city)?.id ?? null;

export const copyDraft = (load: LoadDto, facilities: readonly FacilityOptionDto[]): PostDraft =>
    blankDraft(
        { stops: load.stops.map((stop) => ({ ...blankStop(stop.type, facilityOfStop(stop, facilities)), reference: stop.reference ?? "", instructions: stop.instructions ?? "" })) },
        {
            ...BLANK_FREIGHT,
            equipment: load.equipment,
            commodity: load.commodity,
            weightLb: String(load.weightLb),
            pallets: load.pallets === null ? "" : String(load.pallets),
            tempMinF: load.tempMinF === null ? "" : String(load.tempMinF),
            tempMaxF: load.tempMaxF === null ? "" : String(load.tempMaxF),
            hazmat: load.hazmat,
        },
    );

const reachedOf = (saved: LoadDraftDto): PostStep => {
    if (saved.quote) return "review";
    return saved.freight ? "quote" : "freight";
};

export const resumeStart = (saved: LoadDraftDto): PostStart => {
    const draft = fromServerDraft(saved, reachedOf(saved));
    return { draft, step: draft.reached, source: "draft", reference: saved.id };
};

export const freshStart = (): PostStart => ({ draft: blankDraft(), step: "lane", source: "fresh", reference: null });
