import { can } from "@/lib/auth/capabilities";
import { HTTP_STATUS } from "@/lib/constants";
import type { DraftFreightDto, DraftStopDto, PostLoadResultDto } from "@/lib/contract/schemas";
import { MOCK_FACILITIES } from "@/lib/data/mocks/facilities";
import { MOCK_POSTING, MOCK_POSTING_SCENARIOS } from "@/lib/data/mocks/posting";
import { FREIGHT_MESSAGES, recordEvent, staleLoad, withCaller, type MockCaller } from "@/lib/mocks/freight-access";
import { freightStore } from "@/lib/mocks/freight-store";
import { fail, ok, playScenario } from "@/lib/mocks/http";
import { priceDraft, quoteBurst } from "@/lib/mocks/posting-quote";
import { extrasOf, freightFields, iso, nextLoadId, ownDraft, postingDrafts, postings, stopsOf, toDraftDto } from "@/lib/mocks/posting-store";
import type { MockCharge, MockLoad } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";
import { futureStops, loadDraftRequestSchema, loadDraftUpdateSchema, postLoadRequestSchema, quoteRequestSchema } from "@/lib/validations/posting";

const { messages } = MOCK_POSTING;

const invalid = (path: string) => fail(HTTP_STATUS.badRequest, FREIGHT_MESSAGES.invalid, path);
const missing = (path: string) => fail(HTTP_STATUS.notFound, messages.missing, path);
const conflict = (path: string, message: string) => fail(HTTP_STATUS.conflict, message, path);
const unprocessable = (path: string, message: string) => fail(HTTP_STATUS.unprocessable, message, path);

const canPost = (caller: MockCaller) => Boolean(caller.organisation) && can(caller.user.roles, "postLoads");

const ownFacilities = (caller: MockCaller, stops: readonly DraftStopDto[]) => stops.every((stop) => MOCK_FACILITIES[stop.facilityId]?.organisation === caller.organisation);

const draftFor = (caller: MockCaller, draftId: string) => {
    const load = ownDraft(caller, draftId);
    return load && can(caller.user.roles, "postLoads") ? load : null;
};

const write = (load: MockLoad, caller: MockCaller, stops: readonly DraftStopDto[], freight: DraftFreightDto | null, now: number) => {
    const before = JSON.stringify(toDraftDto(load).stops) + JSON.stringify(extrasOf(load).freight);
    Object.assign(load, { stops: stopsOf(load.id, stops), ...freightFields(freight), version: load.version + 1, updatedAt: iso(now), updatedBy: caller.user.name });
    const kept = extrasOf(load);
    const same = before === JSON.stringify(toDraftDto(load).stops) + JSON.stringify(freight);
    postingDrafts().set(load.id, { ...kept, freight, quote: same ? kept.quote : null });
};

export const createDraft = withCaller(({ path, body }, _params, caller) => {
    if (!canPost(caller) || !caller.organisation) return fail(HTTP_STATUS.forbidden, messages.forbidden, path);
    const input = loadDraftRequestSchema.safeParse(body);
    if (!input.success || !ownFacilities(caller, input.data.stops)) return invalid(path);
    if (!futureStops(input.data.stops)) return unprocessable(path, messages.pastWindow);

    const now = new Date().getTime();
    const id = `HL-${nextLoadId()}`;
    const load: MockLoad = {
        id,
        status: "Draft",
        heldFrom: null,
        version: 0,
        shipper: caller.organisation,
        carrier: null,
        driver: null,
        ...freightFields(input.data.freight),
        bolNumber: null,
        stops: [],
        charges: [],
        track: null,
        seededAt: now,
        createdAt: iso(now),
        updatedAt: iso(now),
    };
    freightStore().loads.set(id, load);
    write(load, caller, input.data.stops, input.data.freight, now);
    recordEvent(id, caller, { type: "statusChanged", category: "status", toStatus: "Draft", note: messages.drafted });
    return ok(HTTP_STATUS.created, toDraftDto(load));
});

export const findDraft = withCaller(({ path }, { draftId }, caller) => {
    const load = draftFor(caller, draftId);
    return load && load.status === "Draft" ? ok(HTTP_STATUS.ok, toDraftDto(load)) : missing(path);
});

export const updateDraft = withCaller(({ path, body }, { draftId }, caller) => {
    const load = draftFor(caller, draftId);
    if (!load) return missing(path);
    if (load.status !== "Draft") return conflict(path, messages.notDraft);
    const input = loadDraftUpdateSchema.safeParse(body);
    if (!input.success || !ownFacilities(caller, input.data.stops)) return invalid(path);
    if (input.data.version !== load.version) return staleLoad(path, messages.stale, load);
    if (!futureStops(input.data.stops)) return unprocessable(path, messages.pastWindow);

    write(load, caller, input.data.stops, input.data.freight, new Date().getTime());
    return ok(HTTP_STATUS.ok, toDraftDto(load));
});

export const quoteDraft = withCaller(({ path, body }, { draftId }, caller) => {
    const load = draftFor(caller, draftId);
    if (!load) return missing(path);
    if (load.status !== "Draft") return conflict(path, messages.notDraft);
    const input = quoteRequestSchema.safeParse(body);
    if (!input.success) return invalid(path);
    if (input.data.version !== load.version) return staleLoad(path, messages.stale, load);

    const extras = extrasOf(load);
    if (!extras.freight) return unprocessable(path, messages.incomplete);
    const scenario = playScenario(MOCK_POSTING_SCENARIOS[extras.freight.commodity.trim().toLowerCase()], path);
    if (scenario) return scenario;
    const now = new Date().getTime();
    const burst = quoteBurst(extras.quotes, now);
    if (burst.limited) return playScenario({ kind: "rate-limited", retryAfter: MOCK_POSTING.quoteBurst.retryAfter }, path);
    if (!futureStops(toDraftDto(load).stops)) return unprocessable(path, messages.pastWindow);

    const quote = priceDraft(load, extras.freight, caller, now);
    postingDrafts().set(load.id, { ...extras, quote, quotes: burst.recent });
    return quote ? ok(HTTP_STATUS.created, quote) : unprocessable(path, messages.unserviceable);
});

export const postDraft = withCaller(({ path, body }, { draftId }, caller) => {
    const input = postLoadRequestSchema.safeParse(body);
    if (!input.success) return invalid(path);
    const done = postings().get(input.data.idempotencyKey);
    if (done) return ok(HTTP_STATUS.created, done);
    if (!canPost(caller)) return fail(HTTP_STATUS.forbidden, messages.forbidden, path);
    const load = draftFor(caller, draftId);
    if (!load) return missing(path);
    if (load.status !== "Draft") return conflict(path, messages.notDraft);
    if (input.data.version !== load.version) return staleLoad(path, messages.stale, load);

    const now = new Date().getTime();
    const { quote } = extrasOf(load);
    if (!quote || quote.id !== input.data.quoteId) return conflict(path, messages.noQuote);
    if (Date.parse(quote.validUntil) <= now) return conflict(path, messages.expired);
    if (!futureStops(toDraftDto(load).stops)) return unprocessable(path, messages.pastWindow);

    const status: PostLoadResultDto["status"] = quote.approval.required ? "PendingApproval" : "Posted";
    const charges = quote.price.parts.map((part): MockCharge => ({ ...part, party: "shipper" }));
    const note = quote.approval.required ? fillTemplate(messages.approval, { approvers: quote.approval.approvers.join(", ") }) : messages.posted;
    Object.assign(load, {
        status,
        charges,
        version: load.version + 1,
        updatedAt: iso(now),
        updatedBy: caller.user.name,
    });
    recordEvent(load.id, caller, { type: "statusChanged", category: "status", fromStatus: "Draft", toStatus: status, note: input.data.note ?? note });
    const result = { loadId: load.id, status, approvers: quote.approval.approvers, decideBy: quote.approval.required ? quote.validUntil : null };
    postings().set(input.data.idempotencyKey, result);
    return ok(HTTP_STATUS.created, result);
});
