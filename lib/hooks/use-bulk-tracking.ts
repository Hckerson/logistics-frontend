import { useMutation, useQueryClient } from "@tanstack/react-query";
import { shareTrackingLinks } from "@/lib/actions/share-tracking-links";
import type { BulkTrackingLinksDto } from "@/lib/contract/schemas";
import { trackingKeys } from "@/lib/hooks/use-tracking";
import { unwrap } from "@/lib/utils/action-result";

export const useShareTrackingLinks = () => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (input: BulkTrackingLinksDto) => unwrap(await shareTrackingLinks(input)),
        onSuccess: (results) =>
            results.forEach(({ loadId, link }) => {
                if (link) void client.invalidateQueries({ queryKey: trackingKeys.links(loadId) });
            }),
    });
};
