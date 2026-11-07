import type { z } from "zod";
import type { LOAD_DATE_FIELDS, LOAD_SORTS, SHIPMENT_STAGES, SHIPMENT_VIEWS } from "@/lib/loads/shipments";
import type { loadListQuerySchema } from "@/lib/validations/freight";
import type { shipmentFiltersSchema, shipmentParamSchema } from "@/lib/validations/shipments";

export type ShipmentStage = (typeof SHIPMENT_STAGES)[number];

export type LoadSort = (typeof LOAD_SORTS)[number];

export type ShipmentView = (typeof SHIPMENT_VIEWS)[number];

export type LoadDateField = (typeof LOAD_DATE_FIELDS)[number];

export type ShipmentFilters = z.infer<typeof shipmentFiltersSchema>;

export type ShipmentParam = keyof z.infer<typeof shipmentParamSchema>;

export type LoadListFilters = z.infer<typeof loadListQuerySchema>;

export interface AppliedFilter {
    id: ShipmentParam;
    label: string;
}

export interface ShipmentDialog {
    kind: "share" | "export" | null;
    key: number;
    job: string | null;
    ids: readonly string[] | null;
}
