import { routes } from "@/lib/contract/routes";
import { createLinks } from "@/lib/mocks/bulk-tracking";
import { completeUpload, downloadDocument, listDocuments, previewDocument, requestUpload } from "@/lib/mocks/documents";
import { createExport, downloadExport, findExport } from "@/lib/mocks/load-exports";
import { confirmImport, excludeImportRows, importRows, mapImport, priceImport, updateImportRow } from "@/lib/mocks/import-steps";
import { completeImport, createImport, findImport, importResults, importTemplate, listFacilities, listImports } from "@/lib/mocks/imports";
import { loadFacets } from "@/lib/mocks/load-facets";
import { transitionLoad } from "@/lib/mocks/load-transitions";
import { cancellationTerms, countLoads, findLoad, listLoads, updateStopInstructions } from "@/lib/mocks/loads";
import { listNotifications, markAllRead, markRead, unreadCount } from "@/lib/mocks/notifications";
import { loadPositions, mapPositions, requestCheckCall } from "@/lib/mocks/positions";
import { quickFind } from "@/lib/mocks/search";
import { pathOf } from "@/lib/mocks/match-route";
import { loadTimeline } from "@/lib/mocks/timeline";
import { createLink, listLinks, publicTracking, revokeLink, sendLink } from "@/lib/mocks/tracking";
import type { MockHandler } from "@/lib/types";

const LOAD = ":loadId";
const BATCH = ":batchId";

export const FREIGHT_HANDLERS: Record<string, MockHandler> = {
    [`GET ${routes.loadsFindAll()}`]: listLoads,
    [`GET ${routes.loadsCounts()}`]: countLoads,
    [`GET ${routes.loadsFacets()}`]: loadFacets,
    [`GET ${routes.loadsFindOne(LOAD)}`]: findLoad,
    [`POST ${routes.loadsTransition(LOAD)}`]: transitionLoad,
    [`GET ${routes.loadsCancellation(LOAD)}`]: cancellationTerms,
    [`POST ${routes.loadsUpdateStopInstructions(LOAD, ":stopId")}`]: updateStopInstructions,
    [`GET ${routes.positionsForLoad(LOAD)}`]: loadPositions,
    [`POST ${routes.positionsCheckCall(LOAD)}`]: requestCheckCall,
    [`GET ${routes.positionsLatest()}`]: mapPositions,
    [`GET ${routes.timelineList(LOAD)}`]: loadTimeline,
    [`GET ${routes.trackingLinksList(LOAD)}`]: listLinks,
    [`POST ${routes.trackingLinksCreate(LOAD)}`]: createLink,
    [`POST ${routes.trackingLinksSend(LOAD)}`]: sendLink,
    [`POST ${routes.trackingLinksRevoke(":linkId")}`]: revokeLink,
    [`POST ${routes.trackingLinksCreateMany()}`]: createLinks,
    [`POST ${routes.exportsCreate()}`]: createExport,
    [`GET ${routes.exportsFindOne(":exportId")}`]: findExport,
    [`GET ${routes.exportsDownload(":exportId")}`]: downloadExport,
    [`GET ${routes.publicTrackingFind(":token")}`]: publicTracking,
    [`GET ${routes.documentsList(LOAD)}`]: listDocuments,
    [`POST ${routes.documentsRequestUpload(LOAD)}`]: requestUpload,
    [`POST ${routes.documentsComplete(":documentId")}`]: completeUpload,
    [`GET ${routes.documentsDownload(":documentId")}`]: downloadDocument,
    [`GET ${routes.documentsPreview(":documentId")}`]: previewDocument,
    [`GET ${routes.notificationsList()}`]: listNotifications,
    [`GET ${routes.notificationsUnreadCount()}`]: unreadCount,
    [`POST ${routes.notificationsMarkAllRead()}`]: markAllRead,
    [`POST ${routes.notificationsMarkRead(":notificationId")}`]: markRead,
    [`GET ${pathOf(routes.searchFind({ q: "" }))}`]: quickFind,
    [`GET ${routes.importsFindAll()}`]: listImports,
    [`POST ${routes.importsCreate()}`]: createImport,
    [`GET ${routes.importsTemplate()}`]: importTemplate,
    [`GET ${routes.importsFindOne(BATCH)}`]: findImport,
    [`POST ${routes.importsComplete(BATCH)}`]: completeImport,
    [`POST ${routes.importsMap(BATCH)}`]: mapImport,
    [`GET ${pathOf(routes.importsRows(BATCH))}`]: importRows,
    [`POST ${routes.importsUpdateRow(BATCH, ":rowId")}`]: updateImportRow,
    [`POST ${routes.importsExclude(BATCH)}`]: excludeImportRows,
    [`POST ${routes.importsPrice(BATCH)}`]: priceImport,
    [`POST ${routes.importsConfirm(BATCH)}`]: confirmImport,
    [`GET ${routes.importsResults(BATCH)}`]: importResults,
    [`GET ${routes.facilitiesFindAll()}`]: listFacilities,
};
