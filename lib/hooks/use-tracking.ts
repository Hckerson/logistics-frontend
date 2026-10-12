import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { revokeTrackingLink } from "@/lib/actions/revoke-tracking-link";
import { sendTrackingLink } from "@/lib/actions/send-tracking-link";
import { shareTrackingLink } from "@/lib/actions/share-tracking-link";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import type { ReasonDto } from "@/lib/contract/schemas";
import { timelineKeys } from "@/lib/hooks/use-load-timeline";
import { REFRESH_MS } from "@/lib/loads/constants";
import { trackingSettled } from "@/lib/loads/tracking";
import type { TrackingSendRequest, TrackingSnapshot } from "@/lib/types";
import { READ_RETRY, unwrap } from "@/lib/utils/action-result";
import { trackingLinksEnvelopeSchema } from "@/lib/validations/freight";
import { trackingEnvelopeSchema } from "@/lib/validations/tracking";

export const trackingKeys = {
    all: ["tracking"] as const,
    public: (token: string) => ["tracking", "public", token] as const,
    links: (loadId: string) => ["tracking", "links", loadId] as const,
};

export const useTracking = (token: string, initial?: TrackingSnapshot) =>
    useQuery({
        queryKey: trackingKeys.public(token),
        queryFn: async ({ signal }) => trackingEnvelopeSchema.parse(await local.get(apiRoutes.tracking(token), { signal })).data,
        initialData: initial?.data,
        initialDataUpdatedAt: initial?.readAt,
        staleTime: REFRESH_MS.publicTracking,
        refetchInterval: ({ state }) => (state.data && !trackingSettled(state.data) ? REFRESH_MS.publicTracking : false),
        ...READ_RETRY,
    });

export const useTrackingLinks = (loadId: string, enabled = true) =>
    useQuery({
        queryKey: trackingKeys.links(loadId),
        queryFn: async ({ signal }) => trackingLinksEnvelopeSchema.parse(await local.get(apiRoutes.loadTrackingLinks(loadId), { signal })).data,
        enabled,
        ...READ_RETRY,
    });

const useLinkMutation = <I, T>(loadId: string, run: (input: I) => Promise<T>) => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: run,
        onSuccess: () => {
            void client.invalidateQueries({ queryKey: trackingKeys.links(loadId) });
            void client.invalidateQueries({ queryKey: timelineKeys.load(loadId) });
        },
    });
};

export const useShareTrackingLink = (loadId: string) =>
    useLinkMutation(loadId, async (input: ReasonDto) => unwrap(await shareTrackingLink(loadId, input)));

export const useSendTrackingLink = (loadId: string) =>
    useLinkMutation(loadId, async (input: TrackingSendRequest) => unwrap(await sendTrackingLink(loadId, input)));

export const useRevokeTrackingLink = (loadId: string) =>
    useLinkMutation(loadId, async ({ linkId, ...input }: ReasonDto & { linkId: string }) => unwrap(await revokeTrackingLink(linkId, input)));
