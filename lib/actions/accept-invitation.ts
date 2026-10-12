"use server";
import { z } from "zod";
import { actionFailure, backendPost, readJson } from "@/lib/api-server";
import { unpublishedRoutes } from "@/lib/api-routes";
import { LEGAL_VERSIONS } from "@/lib/data/legal/library";
import type { ActionResult } from "@/lib/types";
import { contractFailure, invalidInput } from "@/lib/utils/action-result";
import { openSession } from "@/lib/utils/session";
import { withAction } from "@/lib/utils/with-action";
import { acceptAsMemberSchema, acceptAsNewcomerSchema } from "@/lib/validations/team";

interface Newcomer {
    fullName: string;
    password: string;
}

const refusalSchema = z.object({ message: z.string() });

export const acceptInvitation = withAction(async ({ user }, token: string, newcomer?: Newcomer): Promise<ActionResult<null>> => {
    const request = user
        ? acceptAsMemberSchema.safeParse({ token, email: user.email })
        : acceptAsNewcomerSchema.safeParse({ token, ...newcomer, termsVersion: LEGAL_VERSIONS.terms });
    if (!request.success) return invalidInput();

    const upstream = await backendPost(unpublishedRoutes.invitationAccept(), request.data);
    const reply = await readJson(upstream);
    if (!upstream.ok) {
        const refusal = refusalSchema.safeParse(reply);
        return refusal.success ? { ...actionFailure(upstream), message: refusal.data.message } : actionFailure(upstream);
    }

    return (await openSession(reply)) ? { ok: true, data: null } : contractFailure();
});
