import "server-only";
import { backendPost, readJson } from "@/lib/api-server";
import { routes } from "@/lib/contract/routes";
import { HTTP_STATUS, REQUEST_FAILED } from "@/lib/constants";
import type { MfaStatus } from "@/lib/types";
import { readChallenge } from "@/lib/utils/session";
import { emailEnvelopeSchema, linkTokenSchema, mfaStatusSchema } from "@/lib/validations/auth";

const failedUpstream = (upstream: Response) => upstream.status >= HTTP_STATUS.serverError;

export const checkResetToken = async (token: string): Promise<string | null> => {
    const parsed = linkTokenSchema.safeParse({ token });
    if (!parsed.success) return null;

    const upstream = await backendPost(routes.authCheckPasswordReset(), parsed.data);
    if (failedUpstream(upstream)) throw new Error(REQUEST_FAILED);

    const account = emailEnvelopeSchema.safeParse(await readJson(upstream));
    return upstream.ok && account.success ? account.data.data.email : null;
};

export const checkMfaChallenge = async (): Promise<MfaStatus | null> => {
    const challenge = await readChallenge();
    if (!challenge) return null;

    const upstream = await backendPost(routes.authMfaChallenge(), { challenge });
    if (failedUpstream(upstream)) throw new Error(REQUEST_FAILED);

    const status = mfaStatusSchema.safeParse(await readJson(upstream));
    return upstream.ok && status.success ? status.data.data : null;
};
