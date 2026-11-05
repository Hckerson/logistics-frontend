import type { z } from "zod";
import type { SHIPMENT_STAGES } from "@/lib/loads/shipments";
import type { shipmentSearchSchema } from "@/lib/validations/shipments";

export type ShipmentStage = (typeof SHIPMENT_STAGES)[number];

export type ShipmentFilters = z.infer<typeof shipmentSearchSchema>;
