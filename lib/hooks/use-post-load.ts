import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postLoad } from "@/lib/actions/post-load";
import { quoteLoadDraft } from "@/lib/actions/quote-load-draft";
import { createLoadDraft, updateLoadDraft } from "@/lib/actions/save-load-draft";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import type { DraftFreightDto, DraftStopDto, PostLoadRequestDto } from "@/lib/contract/schemas";
import { loadKeys } from "@/lib/hooks/use-loads";
import { failureFrom, unwrap } from "@/lib/utils/action-result";
import { loadDraftEnvelopeSchema } from "@/lib/validations/posting";

interface DraftSave {
    draftId: string | null;
    version: number;
    stops: DraftStopDto[];
    freight: DraftFreightDto | null;
}

const POST_RETRIES = 2;
const RETRYABLE = new Set(["timeout", "unavailable", "server", "offline"]);

export const useSaveDraft = () =>
    useMutation({
        mutationFn: async ({ draftId, version, stops, freight }: DraftSave) =>
            unwrap(draftId ? await updateLoadDraft(draftId, { version, stops, freight }) : await createLoadDraft({ stops, freight })),
    });

export const useFetchDraft = () =>
    useMutation({
        mutationFn: async (draftId: string) => loadDraftEnvelopeSchema.parse(await local.get(apiRoutes.loadDraft(draftId))).data,
    });

export const useQuote = () =>
    useMutation({
        mutationFn: async ({ draftId, version }: { draftId: string; version: number }) => unwrap(await quoteLoadDraft(draftId, { version })),
    });

export const usePostLoad = () => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async ({ draftId, input }: { draftId: string; input: PostLoadRequestDto }) => unwrap(await postLoad(draftId, input)),
        retry: (count, error) => count < POST_RETRIES && RETRYABLE.has(failureFrom(error)?.errorClass ?? "offline"),
        onSuccess: ({ loadId }) => {
            void client.invalidateQueries({ queryKey: loadKeys.lists() });
            void client.invalidateQueries({ queryKey: loadKeys.counts() });
            void client.invalidateQueries({ queryKey: loadKeys.detail(loadId) });
        },
    });
};
