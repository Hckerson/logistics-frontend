import { z } from "zod";
import { apiEnvelopeDtoSchema, publicTrackingDtoSchema, trackingLinkDtoSchema } from "@/lib/contract/schemas";
import { TRACKING_SHARE } from "@/lib/loads/constants";

const PHONE = /^\+?[0-9 ()-]{7,20}$/;

const recipient = z
    .string()
    .trim()
    .refine((value) => z.email().safeParse(value).success || PHONE.test(value));

export const trackingEnvelopeSchema = apiEnvelopeDtoSchema.extend({ data: publicTrackingDtoSchema });

export const trackingSendSchema = z.object({
    recipients: z.array(recipient).min(1).max(TRACKING_SHARE.maxRecipients),
});

export const trackingSendReceiptSchema = z.object({
    link: trackingLinkDtoSchema,
    sent: z.number(),
});
