import { unpublishedRoutes } from "@/lib/api-routes";
import { routes } from "@/lib/contract/routes";
import { completeUpload, downloadDocument, listDocuments, requestUpload } from "@/lib/mocks/documents";
import { transitionLoad } from "@/lib/mocks/load-transitions";
import { countLoads, findLoad, listLoads } from "@/lib/mocks/loads";
import { listNotifications, markAllRead, markRead, unreadCount } from "@/lib/mocks/notifications";
import { loadPositions, mapPositions, requestCheckCall } from "@/lib/mocks/positions";
import { quickFind } from "@/lib/mocks/search";
import { loadTimeline } from "@/lib/mocks/timeline";
import { createLink, listLinks, publicTracking, revokeLink, sendLink } from "@/lib/mocks/tracking";
import type { MockHandler } from "@/lib/types";

const LOAD = ":loadId";

export const FREIGHT_HANDLERS: Record<string, MockHandler> = {
    [`GET ${routes.loadsFindAll()}`]: listLoads,
    [`GET ${routes.loadsCounts()}`]: countLoads,
    [`GET ${routes.loadsFindOne(LOAD)}`]: findLoad,
    [`POST ${routes.loadsTransition(LOAD)}`]: transitionLoad,
    [`GET ${routes.positionsForLoad(LOAD)}`]: loadPositions,
    [`POST ${routes.positionsCheckCall(LOAD)}`]: requestCheckCall,
    [`GET ${routes.positionsLatest()}`]: mapPositions,
    [`GET ${routes.timelineList(LOAD)}`]: loadTimeline,
    [`GET ${routes.trackingLinksList(LOAD)}`]: listLinks,
    [`POST ${routes.trackingLinksCreate(LOAD)}`]: createLink,
    [`POST ${unpublishedRoutes.trackingLinkSend(LOAD)}`]: sendLink,
    [`POST ${routes.trackingLinksRevoke(":linkId")}`]: revokeLink,
    [`GET ${routes.publicTrackingFind(":token")}`]: publicTracking,
    [`GET ${routes.documentsList(LOAD)}`]: listDocuments,
    [`POST ${routes.documentsRequestUpload(LOAD)}`]: requestUpload,
    [`POST ${routes.documentsComplete(":documentId")}`]: completeUpload,
    [`GET ${routes.documentsDownload(":documentId")}`]: downloadDocument,
    [`GET ${routes.notificationsList()}`]: listNotifications,
    [`GET ${routes.notificationsUnreadCount()}`]: unreadCount,
    [`POST ${routes.notificationsMarkAllRead()}`]: markAllRead,
    [`POST ${routes.notificationsMarkRead(":notificationId")}`]: markRead,
    [`GET ${routes.searchFind({ q: "" })}`.split("?")[0]]: quickFind,
};
