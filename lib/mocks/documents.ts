import { nanoid } from "nanoid";
import { HTTP_STATUS, TIME_MS } from "@/lib/constants";
import { documentDtoSchema, uploadRequestDtoSchema, type DocumentDto } from "@/lib/contract/schemas";
import { MOCK_FREIGHT } from "@/lib/data/mocks/loads";
import { DOCUMENT_RULES } from "@/lib/loads/constants";
import { FREIGHT_MESSAGES, loadMissing, recordEvent, visibleLoad, withCaller } from "@/lib/mocks/freight-access";
import { freightStore } from "@/lib/mocks/freight-store";
import { fail, ok } from "@/lib/mocks/http";
import type { MockDocument } from "@/lib/types";

const DOCUMENT_MESSAGES = {
    missing: "Document not found",
    notUploaded: "The file has not reached storage yet",
    mismatch: "The stored file does not match what was declared",
    notReady: "The document is still being checked",
} as const;

const SIGNATURES: Record<DocumentDto["contentType"], readonly number[]> = {
    "application/pdf": [0x25, 0x50, 0x44, 0x46],
    "image/jpeg": [0xff, 0xd8, 0xff],
    "image/png": [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
};

const settled = (document: MockDocument, now: number) => {
    const cleanAt = freightStore().scans.get(document.id);
    if (document.scanStatus === "pending" && cleanAt !== undefined && cleanAt <= now) document.scanStatus = "clean";
    return document;
};

const expiresAt = (now: number) => new Date(now + DOCUMENT_RULES.signedUrlSeconds * TIME_MS.second).toISOString();

const storageUrl = (documentId: string) => `${MOCK_FREIGHT.uploadHost}/${documentId}`;

export const listDocuments = withCaller(({ path }, { loadId }, caller) => {
    const load = visibleLoad(caller, loadId);
    if (!load) return loadMissing(path);

    const now = Date.now();
    const documents = [...freightStore().documents.values()]
        .filter((document) => document.loadId === load.id && document.scanStatus !== "awaitingUpload")
        .map((document) => settled(document, now))
        .sort((first, second) => first.type.localeCompare(second.type) || second.version - first.version);
    return ok(HTTP_STATUS.ok, documents.map((document) => documentDtoSchema.parse(document)));
});

export const requestUpload = withCaller(({ path, body }, { loadId }, caller) => {
    const load = visibleLoad(caller, loadId, "uploadDocument");
    if (!load) return loadMissing(path);
    const input = uploadRequestDtoSchema.safeParse(body);
    if (!input.success) return fail(HTTP_STATUS.badRequest, FREIGHT_MESSAGES.invalid, path);

    const store = freightStore();
    const earlier = [...store.documents.values()].filter(
        (document) => document.loadId === load.id && document.type === input.data.type && document.scanStatus !== "awaitingUpload",
    ).length;
    const now = Date.now();
    const document: MockDocument = {
        ...input.data,
        id: nanoid(),
        loadId: load.id,
        scanStatus: "awaitingUpload",
        version: earlier + 1,
        uploadedByName: caller.user.name,
        createdAt: new Date(now).toISOString(),
    };
    store.documents.set(document.id, document);
    return ok(HTTP_STATUS.created, { document: documentDtoSchema.parse(document), uploadUrl: storageUrl(document.id), expiresAt: expiresAt(now) });
});

export const completeUpload = withCaller(({ path }, { documentId }, caller) => {
    const store = freightStore();
    const document = store.documents.get(documentId);
    const load = document?.scanStatus === "awaitingUpload" && document.uploadedByName === caller.user.name ? visibleLoad(caller, document.loadId, "uploadDocument") : null;
    if (!document || !load) return fail(HTTP_STATUS.notFound, DOCUMENT_MESSAGES.missing, path);

    const stored = store.blobs.get(documentId);
    if (!stored) return fail(HTTP_STATUS.conflict, DOCUMENT_MESSAGES.notUploaded, path);
    if (stored.length !== document.sizeBytes || !SIGNATURES[document.contentType].every((byte, index) => stored[index] === byte)) {
        document.scanStatus = "rejected";
        return fail(HTTP_STATUS.unprocessable, DOCUMENT_MESSAGES.mismatch, path);
    }

    document.scanStatus = "pending";
    store.scans.set(documentId, Date.now() + MOCK_FREIGHT.scanSeconds * TIME_MS.second);
    recordEvent(load.id, caller, { type: "documentUploaded", category: "document" });
    return ok(HTTP_STATUS.ok, documentDtoSchema.parse(document));
});

export const downloadDocument = withCaller(({ path }, { documentId }, caller) => {
    const now = Date.now();
    const found = freightStore().documents.get(documentId);
    const document = found && visibleLoad(caller, found.loadId) ? settled(found, now) : null;
    if (!document) return fail(HTTP_STATUS.notFound, DOCUMENT_MESSAGES.missing, path);
    if (document.scanStatus !== "clean") return fail(HTTP_STATUS.conflict, DOCUMENT_MESSAGES.notReady, path);
    return ok(HTTP_STATUS.ok, { url: storageUrl(document.id), expiresAt: expiresAt(now) });
});
