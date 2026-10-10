import { z } from "zod";
import { FEEDBACK_REASONS } from "@/lib/help/constants";

export const articleFeedbackSchema = z.object({
    slug: z.string().min(1),
    helpful: z.boolean(),
    reason: z.enum(FEEDBACK_REASONS).optional(),
});
