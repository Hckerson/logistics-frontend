import { z } from "zod";
import { apiEnvelopeDtoSchema, invitationDtoSchema } from "@/lib/contract/schemas";
import { LOCATION_DECISIONS } from "@/lib/team/constants";
import { accountSchema, linkTokenSchema } from "@/lib/validations/auth";

export const invitationEnvelopeSchema = apiEnvelopeDtoSchema.extend({ data: invitationDtoSchema });

export const joinSchema = accountSchema.pick({ fullName: true, password: true, consent: true });

export const acceptAsMemberSchema = linkTokenSchema.extend({ email: z.email() });

export const acceptAsNewcomerSchema = linkTokenSchema.extend({
    fullName: joinSchema.shape.fullName,
    password: joinSchema.shape.password,
    termsVersion: z.string().min(1),
});

export const acceptRequestSchema = z.union([acceptAsMemberSchema, acceptAsNewcomerSchema]);

export const locationConsentSchema = z.object({
    email: z.email(),
    decision: z.enum(LOCATION_DECISIONS),
    version: z.string().min(1),
});
