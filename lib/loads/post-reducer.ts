import type { LoadDraftDto, LoadQuoteDto } from "@/lib/contract/schemas";
import { fromServerDraft, furthest, stepIndex } from "@/lib/loads/posting";
import type { FreightEntries, LaneEntries, PostDraft, PostStep } from "@/lib/types";

export type PostAction =
    | { type: "restore"; draft: PostDraft }
    | { type: "lane"; lane: LaneEntries; saved: LoadDraftDto }
    | { type: "freight"; freight: FreightEntries; saved: LoadDraftDto }
    | { type: "quoted"; quote: LoadQuoteDto }
    | { type: "replace"; saved: LoadDraftDto }
    | { type: "rebase"; version: number }
    | { type: "stash"; lane?: LaneEntries; freight?: FreightEntries };

const capped = (reached: PostStep, saved: LoadDraftDto): PostStep => {
    const limit: PostStep = !saved.freight ? "freight" : saved.quote ? "review" : "quote";
    return stepIndex(reached) > stepIndex(limit) ? limit : reached;
};

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

const stashed = (draft: PostDraft, lane: LaneEntries, freight: FreightEntries): PostDraft => {
    const laneChanged = !same(lane, draft.lane);
    if (!laneChanged && same(freight, draft.freight)) return draft;
    const limit: PostStep = laneChanged ? "lane" : "freight";
    return { ...draft, lane, freight, quote: null, reached: stepIndex(draft.reached) > stepIndex(limit) ? limit : draft.reached };
};

const synced = (saved: LoadDraftDto) => ({ draftId: saved.id, version: saved.version, quote: saved.quote });

export const postReducer = (draft: PostDraft, action: PostAction): PostDraft => {
    switch (action.type) {
        case "restore":
            return action.draft;
        case "lane":
            return { ...draft, ...synced(action.saved), lane: action.lane, reached: capped(furthest(draft.reached, "freight"), action.saved) };
        case "freight":
            return { ...draft, ...synced(action.saved), freight: action.freight, reached: capped(furthest(draft.reached, "quote"), action.saved) };
        case "quoted":
            return { ...draft, quote: action.quote, reached: furthest(draft.reached, "review") };
        case "replace":
            return fromServerDraft(action.saved, capped(draft.reached, action.saved));
        case "rebase":
            return { ...draft, version: action.version };
        case "stash":
            return stashed(draft, action.lane ?? draft.lane, action.freight ?? draft.freight);
    }
};

export const openSteps = (draft: PostDraft) => ({
    lane: true,
    freight: stepIndex(draft.reached) >= stepIndex("freight"),
    quote: stepIndex(draft.reached) >= stepIndex("quote"),
    review: stepIndex(draft.reached) >= stepIndex("review") && draft.quote !== null,
});
