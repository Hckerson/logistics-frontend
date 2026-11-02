import { z } from "zod";
import { ACCOUNT_SIDES, MFA_BACKUP_CODE_LENGTH, MFA_CODE_LENGTH, PASSWORD_MIN_LENGTH } from "@/lib/constants";
import {
    apiEnvelopeDtoSchema,
    emailDtoSchema,
    loginDtoSchema,
    mfaChallengeDtoSchema,
    mfaStatusDtoSchema,
    registerDtoSchema,
} from "@/lib/contract/schemas";

const credentials = {
    email: z.string().email(),
    password: z.string().min(PASSWORD_MIN_LENGTH),
};

export const loginSchema = loginDtoSchema.extend(credentials);

export const registerSchema = registerDtoSchema.extend(credentials);

export const signInSchema = loginDtoSchema.extend({
    email: z.string().trim().min(1, "missing").email("invalid"),
    password: z.string().min(1, "missing"),
});

export const accountSchema = registerDtoSchema.pick({ fullName: true, email: true, password: true }).extend({
    side: z.enum(ACCOUNT_SIDES, "missing"),
    fullName: z.string().trim().min(1, "missing"),
    email: z.string().trim().min(1, "missing").email("invalid"),
    password: z.string().min(1, "missing").min(PASSWORD_MIN_LENGTH, "short"),
    consent: z.literal(true, "missing"),
});

export const resetRequestSchema = z.object({
    email: z.string().trim().min(1, "missing").email("invalid"),
});

export const linkTokenSchema = z.object({ token: z.string().trim().min(1) });

export const resetPasswordSchema = linkTokenSchema.extend({ password: credentials.password });

export const emailEnvelopeSchema = apiEnvelopeDtoSchema.extend({ data: emailDtoSchema });

export const newPasswordSchema = z
    .object({
        password: z.string().min(1, "missing").min(PASSWORD_MIN_LENGTH, "short"),
        confirm: z.string().min(1, "missing"),
    })
    .refine(({ password, confirm }) => password === confirm, { path: ["confirm"], message: "mismatch" });

const NOT_BACKUP_GLYPH = /[^A-Z0-9]/g;

export const mfaAnswerSchema = z.discriminatedUnion("method", [
    z.object({
        method: z.literal("totp"),
        code: z.string().min(1, "missing").regex(/^\d+$/, "invalid").length(MFA_CODE_LENGTH, "invalid"),
    }),
    z.object({
        method: z.literal("backup"),
        code: z
            .string()
            .min(1, "missing")
            .transform((value) => value.toUpperCase().replace(NOT_BACKUP_GLYPH, ""))
            .pipe(z.string().length(MFA_BACKUP_CODE_LENGTH, "invalid")),
    }),
]);

export const mfaChallengeRequestSchema = z.object({ challenge: z.string().min(1) });

export const mfaVerifySchema = mfaChallengeRequestSchema.and(mfaAnswerSchema);

export const mfaChallengeSchema = apiEnvelopeDtoSchema.extend({ data: mfaChallengeDtoSchema });

export const mfaStatusSchema = apiEnvelopeDtoSchema.extend({ data: mfaStatusDtoSchema });

export const mfaRefusalSchema = z.object({ attemptsRemaining: z.number().int().nonnegative() });
