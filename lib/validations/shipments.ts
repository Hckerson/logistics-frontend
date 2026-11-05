import { z } from "zod";
import { EQUIPMENT_TYPES } from "@/lib/enums/equipment-type";
import { LOAD_SEARCH_MAX } from "@/lib/loads/constants";
import { SHIPMENT_STAGES } from "@/lib/loads/shipments";

export const shipmentSearchSchema = z.object({
    stage: z.enum(SHIPMENT_STAGES).catch("all"),
    q: z.string().trim().max(LOAD_SEARCH_MAX).catch(""),
    equipment: z.enum(EQUIPMENT_TYPES).nullable().catch(null),
    late: z
        .literal("true")
        .transform(() => true)
        .catch(false),
});
