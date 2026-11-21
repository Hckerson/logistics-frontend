import { routes } from "@/lib/contract/routes";
import { createDraft, findDraft, postDraft, quoteDraft, updateDraft } from "@/lib/mocks/posting";
import type { MockHandler } from "@/lib/types";

const DRAFT = ":draftId";

export const POSTING_HANDLERS: Record<string, MockHandler> = {
    [`POST ${routes.loadDraftsCreate()}`]: createDraft,
    [`GET ${routes.loadDraftsFindOne(DRAFT)}`]: findDraft,
    [`POST ${routes.loadDraftsUpdate(DRAFT)}`]: updateDraft,
    [`POST ${routes.loadDraftsQuote(DRAFT)}`]: quoteDraft,
    [`POST ${routes.loadDraftsPost(DRAFT)}`]: postDraft,
};
