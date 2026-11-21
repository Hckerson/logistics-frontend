import { customAlphabet } from "nanoid";
import { hasAnyRole } from "@/lib/auth/roles";
import type { DraftFreightDto, DraftStopDto, LoadDraftDto, PostLoadResultDto } from "@/lib/contract/schemas";
import { MOCK_IMPORTS } from "@/lib/data/mocks/imports";
import { MOCK_POSTING } from "@/lib/data/mocks/posting";
import type { MockCaller } from "@/lib/mocks/freight-access";
import { freightStore } from "@/lib/mocks/freight-store";
import { mockStore } from "@/lib/mocks/store";
import type { MockLoad, MockPostingDraft, MockStop } from "@/lib/types";

const holder = globalThis as typeof globalThis & {
    haulrPostingDrafts?: Map<string, MockPostingDraft>;
    haulrPostings?: Map<string, PostLoadResultDto>;
};

export const postingDrafts = () => (holder.haulrPostingDrafts ??= new Map<string, MockPostingDraft>());

export const postings = () => (holder.haulrPostings ??= new Map<string, PostLoadResultDto>());

export const nextLoadId = customAlphabet(MOCK_IMPORTS.loadIdAlphabet, MOCK_IMPORTS.loadIdLength);

export const iso = (moment: number) => new Date(moment).toISOString();

const freightOfLoad = (load: MockLoad): DraftFreightDto | null =>
    load.commodity
        ? {
              equipment: load.equipment,
              commodity: load.commodity,
              weightLb: load.weightLb,
              pallets: load.pallets,
              tempMinF: load.tempMinF,
              tempMaxF: load.tempMaxF,
              hazmat: load.hazmat,
              unNumber: null,
              requirements: [],
              poNumber: load.poNumber,
          }
        : null;

export const extrasOf = (load: MockLoad): MockPostingDraft => postingDrafts().get(load.id) ?? { freight: freightOfLoad(load), quote: null, quotes: [] };

export const ownDraft = (caller: MockCaller, draftId: string) => {
    const load = freightStore().loads.get(draftId);
    return load && load.shipper === caller.organisation ? load : null;
};

export const toDraftDto = (load: MockLoad): LoadDraftDto => {
    const { freight, quote } = extrasOf(load);
    return {
        id: load.id,
        version: load.version,
        stops: load.stops.map(({ facility, type, windowStart, windowEnd, reference, instructions }) => ({
            facilityId: facility,
            type,
            windowStart,
            windowEnd,
            reference,
            instructions,
        })),
        freight,
        quote,
        updatedAt: load.updatedAt,
    };
};

export const stopsOf = (loadId: string, stops: readonly DraftStopDto[]): MockStop[] =>
    stops.map(({ facilityId, ...stop }, index) => ({
        ...stop,
        id: `${loadId}-${index + 1}`,
        sequence: index + 1,
        facility: facilityId,
        arrivedAt: null,
        departedAt: null,
    }));

export const freightFields = (freight: DraftFreightDto | null) => ({
    equipment: freight?.equipment ?? MOCK_POSTING.defaults.equipment,
    commodity: freight?.commodity ?? MOCK_POSTING.defaults.commodity,
    weightLb: freight?.weightLb ?? MOCK_POSTING.defaults.weightLb,
    pallets: freight?.pallets ?? null,
    tempMinF: freight?.tempMinF ?? null,
    tempMaxF: freight?.tempMaxF ?? null,
    hazmat: freight?.hazmat ?? false,
    poNumber: freight?.poNumber ?? null,
});

export const approversFor = (organisation: string, requester: string) => {
    const store = mockStore();
    return [...store.users.values()]
        .filter((user) => user.email !== requester && store.memberships.get(user.email) === organisation && hasAnyRole(user.roles, ["shipper.approver"]))
        .map((user) => user.name);
};
