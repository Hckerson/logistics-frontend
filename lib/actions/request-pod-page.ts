"use server";
import { routes } from "@/lib/contract/routes";
import type { DriverPodPageDto } from "@/lib/contract/schemas";
import { invalidInput } from "@/lib/utils/action-result";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { podPageSchema, podTicketEnvelopeSchema } from "@/lib/validations/driver";

export const requestPodPage = withSessionAction(async (_context, loadId: string, input: DriverPodPageDto) => {
    const parsed = podPageSchema.safeParse(input);
    return parsed.success ? backendMutation(routes.driversPodPage(pathSegment(loadId)), parsed.data, podTicketEnvelopeSchema) : invalidInput();
});
