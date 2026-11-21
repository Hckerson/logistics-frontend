import { routes } from "@/lib/contract/routes";
import { getTrip, listTrips, recordStopEvent, undoStopEvent } from "@/lib/mocks/driver";
import { downloadTripDocument } from "@/lib/mocks/driver-documents";
import { requestPodPage, submitPod } from "@/lib/mocks/driver-pod";
import { reportPositions } from "@/lib/mocks/position-reports";
import type { MockHandler } from "@/lib/types";

const LOAD = ":loadId";

export const DRIVER_HANDLERS: Record<string, MockHandler> = {
    [`GET ${routes.driversTrips()}`]: listTrips,
    [`GET ${routes.driversTrip(LOAD)}`]: getTrip,
    [`POST ${routes.driversRecordEvent(LOAD)}`]: recordStopEvent,
    [`POST ${routes.driversUndoEvent(LOAD, ":eventId")}`]: undoStopEvent,
    [`POST ${routes.driversPodPage(LOAD)}`]: requestPodPage,
    [`POST ${routes.driversSubmitPod(LOAD)}`]: submitPod,
    [`GET ${routes.driversDownloadDocument(LOAD, ":documentId")}`]: downloadTripDocument,
    [`POST ${routes.driversReportPositions(LOAD)}`]: reportPositions,
};
