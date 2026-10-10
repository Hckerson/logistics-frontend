import { fail, ok } from "@/lib/mocks/http";
import type { MockHandler } from "@/lib/types";
import { articleFeedbackSchema } from "@/lib/validations/help";

export const recordFeedback: MockHandler = ({ body, path }) =>
    articleFeedbackSchema.safeParse(body).success ? ok(202, { accepted: true }) : fail(400, "Validation failed", path);
