import { documentPreviewDtoSchema } from "@/lib/contract/schemas";
import { enveloped } from "@/lib/validations/freight";

export const documentPreviewEnvelopeSchema = enveloped(documentPreviewDtoSchema);
