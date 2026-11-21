import { documentLink } from "@/lib/mocks/documents";
import { withCaller } from "@/lib/mocks/freight-access";
import { freightStore } from "@/lib/mocks/freight-store";
import { assignedLoad, HIDDEN_DOCUMENTS } from "@/lib/mocks/driver-trips";

export const downloadTripDocument = withCaller(({ path }, { loadId, documentId }, caller) => {
    const load = assignedLoad(caller, loadId);
    const found = freightStore().documents.get(documentId);
    const shown = load && found && found.loadId === load.id && !HIDDEN_DOCUMENTS.has(found.type) ? found : null;
    return documentLink(shown, path);
});
