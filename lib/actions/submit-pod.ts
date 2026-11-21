"use server";
import { routes } from "@/lib/contract/routes";
import type { DriverPodSubmitDto } from "@/lib/contract/schemas";
import { invalidInput } from "@/lib/utils/action-result";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { driverTripEnvelopeSchema, podSubmitSchema } from "@/lib/validations/driver";

export const submitPod = withSessionAction(async (_context, loadId: string, input: DriverPodSubmitDto) => {
    const parsed = podSubmitSchema.safeParse(input);
    return parsed.success ? backendMutation(routes.driversSubmitPod(pathSegment(loadId)), parsed.data, driverTripEnvelopeSchema) : invalidInput();
});
