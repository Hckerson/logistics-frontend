import { apiEnvelopeDtoSchema, networkStatsDtoSchema } from "@/lib/contract/schemas";

export const networkStatsEnvelopeSchema = apiEnvelopeDtoSchema.extend({ data: networkStatsDtoSchema });
