import { z } from "zod";
import {
    assignLoadDtoSchema,
    driverInvitationDtoSchema,
    fleetDriverDtoSchema,
    fleetRosterDtoSchema,
    fleetVehicleDtoSchema,
    fleetOptionsDtoSchema,
    fleetPlanDtoSchema,
    fleetUnavailableDtoSchema,
    invitationSentDtoSchema,
    inviteDriverDtoSchema,
    recommendedLoadDtoSchema,
    saveVehicleDtoSchema,
    truckUnavailableDtoSchema,
} from "@/lib/contract/schemas";
import { EQUIPMENT_TYPES } from "@/lib/enums/equipment-type";
import { FLEET, ROSTER, VEHICLE_KINDS } from "@/lib/fleet/constants";
import { enveloped } from "@/lib/validations/freight";

export const fleetQuerySchema = z.object({
    week: z.string().optional(),
    truck: z.string().optional(),
    driver: z.string().optional(),
    equipment: z.enum(EQUIPMENT_TYPES).optional(),
    carrier: z.string().trim().min(1).max(FLEET.carrierIdMax).optional(),
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

export const vehicleQuerySchema = z.object({ equipment: z.enum(EQUIPMENT_TYPES).optional(), kind: z.enum(VEHICLE_KINDS).optional() });

export const vehicleSchema = saveVehicleDtoSchema
    .extend({
        unit: z.string().trim().min(1).max(ROSTER.unitMax),
        vin: z.string().trim().toUpperCase().regex(ROSTER.vinPattern),
        plate: z.string().trim().toUpperCase().regex(ROSTER.platePattern),
        plateState: z.string().trim().toUpperCase().length(ROSTER.stateLength),
        driverId: z.string().min(1).nullable().optional(),
        version: z.number().int().positive().optional(),
    })
    .refine(({ kind, driverId }) => kind === "truck" || !driverId, { path: ["driverId"] });

export const vehiclesEnvelopeSchema = enveloped(z.array(fleetVehicleDtoSchema));
export const vehicleEnvelopeSchema = enveloped(fleetVehicleDtoSchema);
export const rosterEnvelopeSchema = enveloped(fleetRosterDtoSchema);
export const fleetDriverEnvelopeSchema = enveloped(fleetDriverDtoSchema);
export const driverInvitationEnvelopeSchema = enveloped(driverInvitationDtoSchema);
