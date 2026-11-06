import { z } from "zod";
import { HTTP_STATUS } from "@/lib/constants";
import { FREIGHT_MESSAGES, loadMissing, visibleLoad, withCaller } from "@/lib/mocks/freight-access";
import { fail, ok } from "@/lib/mocks/http";
import { shareable } from "@/lib/mocks/tracking";
import type { MockResponse } from "@/lib/types";
import { bulkTrackingSchema } from "@/lib/validations/freight";

const messageSchema = z.object({ message: z.string() });

const failureOf = ({ status, body }: MockResponse) => ({ status, message: messageSchema.safeParse(body).data?.message ?? FREIGHT_MESSAGES.invalid });

export const createLinks = withCaller(({ path, body }, _params, caller) => {
    const input = bulkTrackingSchema.safeParse(body);
    if (!input.success) return fail(HTTP_STATUS.badRequest, FREIGHT_MESSAGES.invalid, path);

    const { loadIds, reason } = input.data;
    const results = [...new Set(loadIds)].map((loadId) => {
        const load = visibleLoad(caller, loadId, "shareTrackingLink");
        const shared = load ? shareable(load, caller, reason, path) : { failure: loadMissing(path) };
        return "failure" in shared ? { loadId, link: null, failure: failureOf(shared.failure) } : { loadId, link: shared.link, failure: null };
    });
    return ok(HTTP_STATUS.ok, results);
});
