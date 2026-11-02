import type { LaneQuery, LoadListParams, PageParams, TicketStatus, TimelineParams } from "@/lib/types";
import { queryString } from "@/lib/utils/query-string";

export const apiRoutes = {
    session: () => "/api/session",
    register: () => "/api/register",
    rateEstimate: (lane: LaneQuery) => `/api/rate-estimate${queryString(lane)}`,
    laneTrend: (lane: LaneQuery) =>
        `/api/rate-estimate/trend${queryString(lane)}`,
    places: (query: string) => `/api/places${queryString({ q: query })}`,
    tickets: (status?: TicketStatus) =>
        `/api/tickets${queryString({ status })}`,
    tracking: (token: string) => `/api/tracking/${encodeURIComponent(token)}`,
    loads: (query?: LoadListParams) => `/api/loads${queryString(query)}`,
    loadCounts: () => "/api/loads/counts",
    load: (loadId: string) => `/api/loads/${encodeURIComponent(loadId)}`,
    loadPositions: (loadId: string) =>
        `/api/loads/${encodeURIComponent(loadId)}/positions`,
    loadEvents: (loadId: string, query?: TimelineParams) =>
        `/api/loads/${encodeURIComponent(loadId)}/events${queryString(query)}`,
    loadTrackingLinks: (loadId: string) =>
        `/api/loads/${encodeURIComponent(loadId)}/tracking-links`,
    loadDocuments: (loadId: string) =>
        `/api/loads/${encodeURIComponent(loadId)}/documents`,
    documentDownload: (documentId: string) =>
        `/api/documents/${encodeURIComponent(documentId)}/download`,
    mapPositions: () => "/api/positions/latest",
    notifications: (query?: PageParams) =>
        `/api/notifications${queryString(query)}`,
    unreadCount: () => "/api/notifications/unread-count",
    quickFind: (q: string) => `/api/search${queryString({ q })}`,
} as const;
