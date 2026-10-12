import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requestCheckCall } from "@/lib/actions/request-check-call";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import { loadPositionsDtoSchema, type CheckCallDto } from "@/lib/contract/schemas";
import { timelineKeys } from "@/lib/hooks/use-load-timeline";
import { usePageVisible } from "@/lib/hooks/use-page-visible";
import { POSITION_STREAM, REFRESH_MS } from "@/lib/loads/constants";
import { READ_RETRY, unwrap } from "@/lib/utils/action-result";
import { loadPositionsEnvelopeSchema, mapPositionsEnvelopeSchema } from "@/lib/validations/freight";

export const positionKeys = {
    all: ["positions"] as const,
    latest: (loadId: string) => ["positions", "latest", loadId] as const,
    map: () => ["positions", "map"] as const,
};

export const useLoadPositions = (loadId: string, enabled = true) => {
    const client = useQueryClient();
    const visible = usePageVisible();
    const [streaming, setStreaming] = useState(false);

    useEffect(() => {
        if (!enabled || !visible) return;
        const source = new EventSource(apiRoutes.loadPositions(loadId));
        source.addEventListener(POSITION_STREAM.event, (event) => {
            const payload: unknown = JSON.parse(String(event.data));
            const parsed = loadPositionsDtoSchema.safeParse(payload);
            if (parsed.success) client.setQueryData(positionKeys.latest(loadId), parsed.data);
        });
        source.addEventListener(POSITION_STREAM.closeEvent, () => source.close());
        source.onopen = () => setStreaming(true);
        source.onerror = () => setStreaming(false);
        return () => {
            source.close();
            setStreaming(false);
        };
    }, [client, enabled, loadId, visible]);

    return useQuery({
        queryKey: positionKeys.latest(loadId),
        queryFn: async ({ signal }) => loadPositionsEnvelopeSchema.parse(await local.get(apiRoutes.loadPositions(loadId), { signal })).data,
        enabled,
        staleTime: REFRESH_MS.tracking,
        refetchInterval: streaming ? false : REFRESH_MS.tracking,
        ...READ_RETRY,
    });
};

export const useMapPositions = (enabled = true) =>
    useQuery({
        queryKey: positionKeys.map(),
        queryFn: async ({ signal }) => mapPositionsEnvelopeSchema.parse(await local.get(apiRoutes.mapPositions(), { signal })).data,
        enabled,
        staleTime: REFRESH_MS.tracking,
        refetchInterval: REFRESH_MS.tracking,
        ...READ_RETRY,
    });

export const useCheckCall = (loadId: string) => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (input: CheckCallDto) => unwrap(await requestCheckCall(loadId, input)),
        onSuccess: () => client.invalidateQueries({ queryKey: timelineKeys.load(loadId) }),
    });
};
