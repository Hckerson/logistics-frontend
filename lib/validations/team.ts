import { z } from "zod";
import { ACCOUNT_SIDES } from "@/lib/constants";
import { apiEnvelopeDtoSchema } from "@/lib/contract/schemas";
import { INVITATION_STATUSES, INVITED_ACCOUNTS, LOCATION_DECISIONS, TEAM_ROLES } from "@/lib/team/constants";
import { accountSchema, linkTokenSchema } from "@/lib/validations/auth";

export const invitationSchema = z.object({
    email: z.email(),
    organisation: z.string(),
    side: z.enum(ACCOUNT_SIDES),
    sso: z.boolean(),
    inviter: z.string(),
    role: z.enum(TEAM_ROLES),
    status: z.enum(INVITATION_STATUSES),
    account: z.enum(INVITED_ACCOUNTS),
});

export const invitationEnvelopeSchema = apiEnvelopeDtoSchema.extend({ data: invitationSchema });

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
