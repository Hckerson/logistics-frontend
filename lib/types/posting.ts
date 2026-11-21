import type { DraftFreightDto, DraftStopDto, FacilityOptionDto, LoadQuoteDto } from "@/lib/contract/schemas";
import type { Equipment } from "./quote";
import type { DateRangeValue } from "./ui";

export type PostStep = "lane" | "freight" | "quote" | "review";

export type StopType = DraftStopDto["type"];

export type Requirement = DraftFreightDto["requirements"][number];

export type QuoteConfidence = LoadQuoteDto["confidence"];

export interface StopEntry {
    key: string;
    type: StopType;
    facilityId: string | null;
    window: DateRangeValue | null;
    reference: string;
    instructions: string;
}

export interface LaneEntries {
    stops: StopEntry[];
}

export interface FreightEntries {
    equipment: Equipment | null;
    commodity: string;
    weightLb: string;
    pallets: string;
    tempMinF: string;
    tempMaxF: string;
    hazmat: boolean;
    unNumber: string;
    requirements: Requirement[];
    poNumber: string;
}

export interface PostDraft {
    draftId: string | null;
    version: number;
    lane: LaneEntries;
    freight: FreightEntries;
    quote: LoadQuoteDto | null;
    reached: PostStep;
    savedAt: number;
}

export interface PostStart {
    draft: PostDraft;
    step: PostStep;
    source: "fresh" | "lane" | "copy" | "draft";
    reference: string | null;
}

export type FacilityIndex = ReadonlyMap<string, FacilityOptionDto>;

export interface MockPostingDraft {
    freight: DraftFreightDto | null;
    quote: LoadQuoteDto | null;
    quotes: number[];
}
