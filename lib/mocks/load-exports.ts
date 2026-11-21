import { nanoid } from "nanoid";
import { HTTP_STATUS, TIME_MS } from "@/lib/constants";
import type { ExportJobDto, LoadExportFiltersDto } from "@/lib/contract/schemas";
import { MOCK_EXPORTS } from "@/lib/data/mocks/exports";
import { MOCK_FACILITIES } from "@/lib/data/mocks/facilities";
import { MOCK_ORGANISATIONS } from "@/lib/data/mocks/team";
import { FREIGHT_MESSAGES, visibleLoad, withCaller, type MockCaller } from "@/lib/mocks/freight-access";
import { freightStore } from "@/lib/mocks/freight-store";
import { fail, ok } from "@/lib/mocks/http";
import { EXPORT_RULES } from "@/lib/loads/shipments";
import { deliveryOf, findLoads, pickupOf } from "@/lib/mocks/load-query";
import type { MockExport, MockLoad } from "@/lib/types";
import { csvLine } from "@/lib/utils/csv";
import { fillTemplate } from "@/lib/utils/fill-template";
import { exportRequestSchema, loadListQuerySchema } from "@/lib/validations/freight";

const holder = globalThis as typeof globalThis & { haulrExports?: Map<string, MockExport> };
const jobs = () => (holder.haulrExports ??= new Map<string, MockExport>());
const iso = (moment: number) => new Date(moment).toISOString();
const durationOf = (job: MockExport) => (job.loadIds.length > EXPORT_RULES.instantRows ? MOCK_EXPORTS.jobMs : MOCK_EXPORTS.quickMs);
const readyAt = (job: MockExport) => job.createdAt + durationOf(job);
const expiresAt = (job: MockExport) => readyAt(job) + MOCK_EXPORTS.ttlHours * TIME_MS.hour;
const fileNameOf = (job: MockExport) => fillTemplate(MOCK_EXPORTS.fileName, { date: iso(job.createdAt).slice(0, 10) });

const statusOf = (job: MockExport, now: number): ExportJobDto["status"] => {
    if (now >= expiresAt(job)) return "expired";
    if (now >= readyAt(job)) return "ready";
    return now - job.createdAt < MOCK_EXPORTS.queuedMs ? "queued" : "running";
};

const rowOf = (load: MockLoad) =>
    csvLine([
        load.id,
        load.status,
        MOCK_FACILITIES[pickupOf(load).facility].city,
        MOCK_FACILITIES[deliveryOf(load).facility].city,
        pickupOf(load).windowStart,
        deliveryOf(load).windowStart,
        load.carrier ? MOCK_ORGANISATIONS[load.carrier].name : "",
        load.equipment,
    ]);

const csvOf = (job: MockExport) => {
    const loads = freightStore().loads;
    const rows = job.loadIds.flatMap((id) => {
        const load = loads.get(id);
        return load ? [rowOf(load)] : [];
    });
    return [MOCK_EXPORTS.columns.join(","), ...rows].join("\n");
};

const viewOf = (job: MockExport, now: number): ExportJobDto => {
    const status = statusOf(job, now);
    const done = status === "ready" || status === "expired";
    return {
        id: job.id,
        dataset: "loads",
        format: "csv",
        status,
        rowCount: job.loadIds.length,
        progress: Math.min(1, (now - job.createdAt) / durationOf(job)),
        fileName: fileNameOf(job),
        sizeBytes: done ? new TextEncoder().encode(csvOf(job)).length : null,
        createdAt: iso(job.createdAt),
        readyAt: done ? iso(readyAt(job)) : null,
        expiresAt: done ? iso(expiresAt(job)) : null,
    };
};

export const settleExports = (now = new Date().getTime()) => {
    const notifications = freightStore().notifications;
    for (const job of jobs().values()) {
        if (job.notified || job.loadIds.length <= EXPORT_RULES.instantRows || statusOf(job, now) !== "ready") continue;
        job.notified = true;
        const id = nanoid();
        notifications.set(id, { id, userId: job.userId, event: "exportReady", loadId: null, exportId: job.id, createdAt: iso(readyAt(job)), readAt: null });
    }
};

const filteredIds = (caller: MockCaller, filters: LoadExportFiltersDto | undefined, now: number) => {
    const query = loadListQuerySchema.safeParse(Object.fromEntries(Object.entries(filters ?? {}).flatMap(([key, value]) => (value === undefined ? [] : [[key, String(value)]]))));
    return query.success ? findLoads(caller, query.data, now).map((load) => load.id) : null;
};

export const createExport = withCaller(({ path, body }, _params, caller) => {
    const input = exportRequestSchema.safeParse(body);
    if (!input.success) return fail(HTTP_STATUS.badRequest, FREIGHT_MESSAGES.invalid, path);

    const now = new Date().getTime();
    const running = [...jobs().values()].filter((job) => job.organisation === caller.organisation && now < readyAt(job)).length;
    if (running >= MOCK_EXPORTS.concurrent) {
        return fail(HTTP_STATUS.tooManyRequests, MOCK_EXPORTS.messages.busy, path, { "Retry-After": String(MOCK_EXPORTS.retryAfterSeconds) });
    }

    const loadIds = input.data.loadIds ? input.data.loadIds.filter((id) => visibleLoad(caller, id)) : filteredIds(caller, input.data.filters, now);
    if (!loadIds) return fail(HTTP_STATUS.badRequest, FREIGHT_MESSAGES.invalid, path);

    const job: MockExport = { id: `exp_${nanoid()}`, userId: caller.user.id, organisation: caller.organisation, loadIds, createdAt: now, notified: false };
    jobs().set(job.id, job);
    return ok(HTTP_STATUS.ok, viewOf(job, now));
});

const ownJob = (exportId: string, userId: string) => {
    const job = jobs().get(exportId);
    return job && job.userId === userId ? job : null;
};

export const findExport = withCaller(({ path }, { exportId }, caller) => {
    const job = ownJob(exportId, caller.user.id);
    if (!job) return fail(HTTP_STATUS.notFound, MOCK_EXPORTS.messages.missing, path);
    settleExports();
    return ok(HTTP_STATUS.ok, viewOf(job, new Date().getTime()));
});

export const downloadExport = withCaller(({ path }, { exportId }, caller) => {
    const job = ownJob(exportId, caller.user.id);
    if (!job) return fail(HTTP_STATUS.notFound, MOCK_EXPORTS.messages.missing, path);
    const now = new Date().getTime();
    const status = statusOf(job, now);
    if (status === "expired") return fail(HTTP_STATUS.notFound, MOCK_EXPORTS.messages.expired, path);
    if (status !== "ready") return fail(HTTP_STATUS.conflict, MOCK_EXPORTS.messages.notReady, path);
    return ok(HTTP_STATUS.ok, { url: `${MOCK_EXPORTS.storagePath}/${job.id}`, expiresAt: iso(now + MOCK_EXPORTS.downloadMinutes * TIME_MS.minute) });
});

export const exportFile = (exportId: string) => {
    const job = jobs().get(exportId);
    return job && statusOf(job, new Date().getTime()) === "ready" ? { fileName: fileNameOf(job), body: csvOf(job) } : null;
};
