import type { z } from "zod";
import type { SHIPMENT_STAGES } from "@/lib/loads/shipments";
import type { loadListQuerySchema } from "@/lib/validations/freight";
import type { shipmentSearchSchema } from "@/lib/validations/shipments";

export type ShipmentStage = (typeof SHIPMENT_STAGES)[number];

export type ShipmentFilters = z.infer<typeof shipmentSearchSchema>;

export type LoadListFilters = z.infer<typeof loadListQuerySchema>;
