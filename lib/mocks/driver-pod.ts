import { HTTP_STATUS, TIME_MS } from "@/lib/constants";
import { MOCK_POD } from "@/lib/data/mocks/drivers";
import { DOCUMENT_RULES } from "@/lib/loads/constants";
import { conflict, DRIVER_MESSAGES, missing, tripReply } from "@/lib/mocks/driver";
import { driverStore } from "@/lib/mocks/driver-store";
import { assignedLoad } from "@/lib/mocks/driver-trips";
import { FREIGHT_MESSAGES, recordEvent, withCaller } from "@/lib/mocks/freight-access";
import { freightStore } from "@/lib/mocks/freight-store";
import { fail, ok } from "@/lib/mocks/http";
import type { MockLoad } from "@/lib/types";
import { podPageSchema, podSubmitSchema } from "@/lib/validations/driver";

const podOpen = (load: MockLoad) => load.stops[load.stops.length - 1].arrivedAt !== null;

export const requestPodPage = withCaller(({ path, body }, { loadId }, caller) => {
    const load = assignedLoad(caller, loadId);
    if (!load) return missing(path);
    const input = podPageSchema.safeParse(body);
    if (!input.success || input.data.sizeBytes > DOCUMENT_RULES.maxBytes) return fail(HTTP_STATUS.badRequest, FREIGHT_MESSAGES.invalid, path);
    if (!podOpen(load)) return conflict(path, DRIVER_MESSAGES.podClosed);
    if (driverStore().pods.get(load.id)?.settled) return conflict(path, DRIVER_MESSAGES.podDone);

    const { documents } = freightStore();
    const now = new Date().getTime();
    if (!documents.has(input.data.id)) {
        const pages = [...documents.values()].filter((document) => document.loadId === load.id && document.type === "pod").length;
        documents.set(input.data.id, {
            id: input.data.id,
            loadId: load.id,
            type: "pod",
            fileName: `pod-${load.id}-${pages + 1}.${input.data.contentType === "image/png" ? "png" : "jpg"}`,
            contentType: input.data.contentType,
            sizeBytes: input.data.sizeBytes,
            scanStatus: "awaitingUpload",
            version: pages + 1,
            uploadedByName: caller.user.name,
            createdAt: new Date(now).toISOString(),
        });
    }
    return ok(HTTP_STATUS.ok, {
        uploadUrl: `${MOCK_POD.uploadHost}/${input.data.id}`,
        expiresAt: new Date(now + DOCUMENT_RULES.signedUrlSeconds * TIME_MS.second).toISOString(),
    });
});

export const submitPod = withCaller(({ path, body }, { loadId }, caller) => {
    const load = assignedLoad(caller, loadId);
    if (!load) return missing(path);
    const input = podSubmitSchema.safeParse(body);
    if (!input.success) return fail(HTTP_STATUS.badRequest, FREIGHT_MESSAGES.invalid, path);

    const store = driverStore();
    if (store.pods.get(load.id)?.id === input.data.id) return tripReply(caller, load);
    if (!podOpen(load)) return conflict(path, DRIVER_MESSAGES.podClosed);
    if (store.pods.get(load.id)?.settled) return conflict(path, DRIVER_MESSAGES.podDone);

    const { documents, blobs, scans } = freightStore();
    const pages = input.data.pageIds.map((id) => documents.get(id));
    if (pages.some((page) => !page || page.loadId !== load.id || !blobs.has(page.id))) return conflict(path, DRIVER_MESSAGES.uploading);

    const now = new Date().getTime();
    const verifyAt = now + MOCK_POD.verifySeconds * TIME_MS.second;
    input.data.pageIds.forEach((id) => {
        const page = documents.get(id);
        if (page) page.scanStatus = "pending";
        scans.set(id, verifyAt);
    });
    store.pods.set(load.id, {
        id: input.data.id,
        loadId: load.id,
        pageIds: input.data.pageIds,
        receiverName: input.data.receiverName,
        osdNotes: input.data.osdNotes ?? null,
        submittedAt: now,
        verifyAt,
        settled: false,
    });
    recordEvent(load.id, caller, { type: "documentUploaded", category: "document", documentId: input.data.pageIds[0], source: "driver", note: input.data.osdNotes ?? null });
    return tripReply(caller, load);
});
