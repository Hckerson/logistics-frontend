import { HTTP_STATUS } from "@/lib/constants";
import { POSITION_REPORTING } from "@/lib/driver/constants";
import { FREIGHT_MESSAGES, loadMissing, withCaller } from "@/lib/mocks/freight-access";
import { freightStore } from "@/lib/mocks/freight-store";
import { fail, ok } from "@/lib/mocks/http";
import { positionReports, reportedPositions } from "@/lib/mocks/position-store";
import { mockStore } from "@/lib/mocks/store";
import type { LoadStatus } from "@/lib/types";
import { positionReportSchema } from "@/lib/validations/driver";

const POSITION_MESSAGES = {
    inactive: "Positions are reported only while a trip is under way",
    consent: "Location sharing was declined for this driver",
} as const;

const reporting = (status: LoadStatus) => POSITION_REPORTING.statuses.some((allowed) => allowed === status);

export const reportPositions = withCaller(({ path, body }, { loadId }, caller) => {
    const load = freightStore().loads.get(loadId);
    if (!load || load.driver !== caller.user.id) return loadMissing(path);
    if (!reporting(load.status)) return fail(HTTP_STATUS.conflict, POSITION_MESSAGES.inactive, path);
    if (mockStore().locationConsents.get(caller.user.email.toLowerCase()) === "declined") return fail(HTTP_STATUS.forbidden, POSITION_MESSAGES.consent, path);
    const input = positionReportSchema.safeParse(body);
    if (!input.success) return fail(HTTP_STATUS.badRequest, FREIGHT_MESSAGES.invalid, path);

    const known = reportedPositions(load.id);
    const seen = new Set(known.map(({ id }) => id));
    const fresh = input.data.positions.filter(({ id }) => !seen.has(id));
    const kept = [...known, ...fresh].sort((first, second) => Date.parse(first.recordedAt) - Date.parse(second.recordedAt)).slice(-POSITION_REPORTING.keptPerLoad);
    positionReports().set(load.id, kept);
    return ok(HTTP_STATUS.ok, { accepted: fresh.length });
});
