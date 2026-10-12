import "server-only";
import { backendPost, readJson } from "@/lib/api-server";
import { unpublishedRoutes } from "@/lib/api-routes";
import { HTTP_STATUS, REQUEST_FAILED } from "@/lib/constants";
import type { Invitation } from "@/lib/types";
import { linkTokenSchema } from "@/lib/validations/auth";
import { invitationEnvelopeSchema } from "@/lib/validations/team";

export const checkInvitation = async (token: string): Promise<Invitation | null> => {
    const parsed = linkTokenSchema.safeParse({ token });
    if (!parsed.success) return null;

    const upstream = await backendPost(unpublishedRoutes.invitationCheck(), parsed.data);
    if (upstream.status >= HTTP_STATUS.serverError) throw new Error(REQUEST_FAILED);

    const found = invitationEnvelopeSchema.safeParse(await readJson(upstream));
    return upstream.ok && found.success ? found.data.data : null;
};
