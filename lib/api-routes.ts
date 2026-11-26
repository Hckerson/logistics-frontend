import type { FleetQuery, ImportRowsParams, LaneQuery, LoadBoardQuery, LoadListParams, PageParams, RecommendationQuery, TicketStatus, TimelineParams, VehicleQuery } from "@/lib/types";
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
    loadFacets: () => "/api/loads/facets",
    exportJob: (exportId: string) => `/api/exports/${encodeURIComponent(exportId)}`,
    exportDownload: (exportId: string) => `/api/exports/${encodeURIComponent(exportId)}/download`,
    load: (loadId: string) => `/api/loads/${encodeURIComponent(loadId)}`,
    loadDraft: (draftId: string) => `/api/loads/drafts/${encodeURIComponent(draftId)}`,
    loadFleet: (loadId: string) => `/api/loads/${encodeURIComponent(loadId)}/fleet`,
    loadBoard: (query: LoadBoardQuery) => `/api/load-board${queryString(query)}`,
    loadBooking: (loadId: string) => `/api/loads/${encodeURIComponent(loadId)}/booking`,
    fleetPlan: (query?: FleetQuery) => `/api/fleet/plan${queryString(query)}`,
    fleetRecommendations: (query: RecommendationQuery) => `/api/fleet/recommendations${queryString(query)}`,
    fleetVehicles: (query?: VehicleQuery) => `/api/fleet/vehicles${queryString(query)}`,
    fleetDrivers: () => "/api/fleet/drivers",
    driverTrips: () => "/api/driver/trips",
    driverTrip: (loadId: string) => `/api/driver/trips/${encodeURIComponent(loadId)}`,
    driverDocument: (loadId: string, documentId: string) =>
        `/api/driver/trips/${encodeURIComponent(loadId)}/documents/${encodeURIComponent(documentId)}/download`,
    loadCancellation: (loadId: string) =>
        `/api/loads/${encodeURIComponent(loadId)}/cancellation`,
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
    documentPreview: (documentId: string) => `/api/documents/${encodeURIComponent(documentId)}/preview`,
    driverDocumentPreview: (loadId: string, documentId: string) =>
        `/api/driver/trips/${encodeURIComponent(loadId)}/documents/${encodeURIComponent(documentId)}/preview`,
    mapPositions: (loadIds?: readonly string[]) => `/api/positions/latest${queryString({ loadIds: loadIds?.join(",") })}`,
    notifications: (query?: PageParams) =>
        `/api/notifications${queryString(query)}`,
    unreadCount: () => "/api/notifications/unread-count",
    quickFind: (q: string) => `/api/search${queryString({ q })}`,
    imports: (query?: PageParams) => `/api/imports${queryString(query)}`,
    importTemplate: () => "/api/imports/template",
    importBatch: (batchId: string) => `/api/imports/${encodeURIComponent(batchId)}`,
    importRows: (batchId: string, query?: ImportRowsParams) => `/api/imports/${encodeURIComponent(batchId)}/rows${queryString(query)}`,
    importResults: (batchId: string) => `/api/imports/${encodeURIComponent(batchId)}/results`,
    facilities: () => "/api/facilities",
    standing: () => "/api/standing",
    invoice: (invoiceId: string) => `/api/invoices/${encodeURIComponent(invoiceId)}`,
    paymentMethods: () => "/api/payment-methods",
    remittance: (paymentId: string) => `/api/invoice-payments/${encodeURIComponent(paymentId)}/remittance`,
} as const;
