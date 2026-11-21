import { z } from "zod";
import {
    assignLoadDtoSchema,
    fleetOptionsDtoSchema,
    fleetPlanDtoSchema,
    fleetUnavailableDtoSchema,
    invitationSentDtoSchema,
    inviteDriverDtoSchema,
    recommendedLoadDtoSchema,
    truckUnavailableDtoSchema,
} from "@/lib/contract/schemas";
import { EQUIPMENT_TYPES } from "@/lib/enums/equipment-type";
import { FLEET } from "@/lib/fleet/constants";
import { enveloped } from "@/lib/validations/freight";

export const fleetQuerySchema = z.object({
    week: z.string().optional(),
    truck: z.string().optional(),
    driver: z.string().optional(),
    equipment: z.enum(EQUIPMENT_TYPES).optional(),
});

export const assignSchema = assignLoadDtoSchema.extend({ reason: z.string().trim().min(1).max(FLEET.reasonMax).optional() });

export const unavailableSchema = truckUnavailableDtoSchema
    .extend({ note: z.string().trim().max(FLEET.noteMax).optional() })
    .refine(({ from, to }) => Date.parse(to) > Date.parse(from), { path: ["to"] });

export const recommendationQuerySchema = z.object({ truck: z.string().min(1), from: z.string().min(1), to: z.string().min(1) });

export const fleetPlanEnvelopeSchema = enveloped(fleetPlanDtoSchema);
export const fleetOptionsEnvelopeSchema = enveloped(fleetOptionsDtoSchema);
export const fleetUnavailableEnvelopeSchema = enveloped(fleetUnavailableDtoSchema);
export const recommendationsEnvelopeSchema = enveloped(z.array(recommendedLoadDtoSchema));

export const inviteDriverSchema = inviteDriverDtoSchema.extend({
    email: z.email().max(FLEET.emailMax),
    note: z.string().trim().max(FLEET.noteMax).optional(),
});

export const invitationSentEnvelopeSchema = enveloped(invitationSentDtoSchema);
