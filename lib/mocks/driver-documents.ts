import { documentLink, documentPreview } from "@/lib/mocks/documents";
import { withCaller, type MockCaller } from "@/lib/mocks/freight-access";
import { freightStore } from "@/lib/mocks/freight-store";
import { assignedLoad, HIDDEN_DOCUMENTS } from "@/lib/mocks/driver-trips";

const tripDocument = (caller: MockCaller, loadId: string, documentId: string) => {
    const load = assignedLoad(caller, loadId);
    const found = freightStore().documents.get(documentId);
    return load && found && found.loadId === load.id && !HIDDEN_DOCUMENTS.has(found.type) ? found : null;
};

export const downloadTripDocument = withCaller(({ path }, { loadId, documentId }, caller) => documentLink(tripDocument(caller, loadId, documentId), path));

export const previewTripDocument = withCaller(({ path }, { loadId, documentId }, caller) => documentPreview(tripDocument(caller, loadId, documentId), path));
