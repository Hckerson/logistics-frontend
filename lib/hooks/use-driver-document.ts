import { useMutation } from "@tanstack/react-query";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import { downloadLinkEnvelopeSchema } from "@/lib/validations/freight";

export const useDriverDocument = (loadId: string) =>
    useMutation({
        mutationFn: async (documentId: string) => downloadLinkEnvelopeSchema.parse(await local.get(apiRoutes.driverDocument(loadId, documentId))).data,
        onSuccess: ({ url }) => window.location.assign(url),
    });
