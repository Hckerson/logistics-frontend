"use server";
import { routes } from "@/lib/contract/routes";
import type { DriverPositionsDto } from "@/lib/contract/schemas";
import { invalidInput } from "@/lib/utils/action-result";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { positionReportSchema, positionsAcceptedEnvelopeSchema } from "@/lib/validations/driver";

export const reportPositions = withSessionAction(async (_context, loadId: string, input: DriverPositionsDto) => {
    const parsed = positionReportSchema.safeParse(input);
    return parsed.success ? backendMutation(routes.driversReportPositions(pathSegment(loadId)), parsed.data, positionsAcceptedEnvelopeSchema) : invalidInput();
});
