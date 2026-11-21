"use server";
import { routes } from "@/lib/contract/routes";
import type { AssignLoadDto } from "@/lib/contract/schemas";
import { invalidInput } from "@/lib/utils/action-result";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { assignSchema } from "@/lib/validations/fleet";
import { loadEnvelopeSchema } from "@/lib/validations/freight";

export const assignLoad = withSessionAction(async (_context, loadId: string, input: AssignLoadDto) => {
    const parsed = assignSchema.safeParse(input);
    return parsed.success ? backendMutation(routes.fleetAssign(pathSegment(loadId)), parsed.data, loadEnvelopeSchema) : invalidInput();
});
