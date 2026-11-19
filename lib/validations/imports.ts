import { z } from "zod";
import {
    facilityOptionDtoSchema,
    importBatchDtoSchema,
    importBatchPageDtoSchema,
    importConfirmRequestDtoSchema,
    importExcludeRequestDtoSchema,
    importMappingRequestDtoSchema,
    importRowDtoSchema,
    importRowPageDtoSchema,
    importRowUpdateDtoSchema,
    importUploadRequestDtoSchema,
    importUploadTicketDtoSchema,
    importVersionDtoSchema,
} from "@/lib/contract/schemas";
import { IMPORT_FIELDS, IMPORT_RULES } from "@/lib/loads/imports";
import { enveloped } from "@/lib/validations/freight";

const cursor = z.string().max(IMPORT_RULES.idMax).optional();
const limit = z.coerce.number().int().min(1).max(IMPORT_RULES.pageSize).optional();

export const importUploadSchema = importUploadRequestDtoSchema.extend({
    fileName: z.string().trim().min(1).max(IMPORT_RULES.fileNameMax),
    sizeBytes: z.number().int().min(1).max(IMPORT_RULES.maxBytes),
});

export const importMappingSchema = importMappingRequestDtoSchema.refine(({ columns }) => {
    const fields = columns.flatMap(({ field }) => (field ? [field] : []));
    return new Set(fields).size === fields.length && fields.every((field) => IMPORT_FIELDS.includes(field));
});

export const importRowUpdateSchema = importRowUpdateDtoSchema.refine(({ values }) => Object.values(values).every((value) => value.length <= IMPORT_RULES.valueMax));

export const importExcludeSchema = importExcludeRequestDtoSchema.extend({
    rowIds: z.array(z.string().max(IMPORT_RULES.idMax)).min(1).max(IMPORT_RULES.maxRows),
});

export const importVersionSchema = importVersionDtoSchema;
export const importConfirmSchema = importConfirmRequestDtoSchema;

export const importPageQuerySchema = z.object({ cursor, limit });
export const importRowsQuerySchema = z.object({ outcome: z.enum(["valid", "warning", "invalid", "excluded"]).optional(), cursor, limit });

export const importBatchEnvelopeSchema = enveloped(importBatchDtoSchema);
export const importBatchPageEnvelopeSchema = enveloped(importBatchPageDtoSchema);
export const importTicketEnvelopeSchema = enveloped(importUploadTicketDtoSchema);
export const importRowEnvelopeSchema = enveloped(importRowDtoSchema);
export const importRowPageEnvelopeSchema = enveloped(importRowPageDtoSchema);
export const facilitiesEnvelopeSchema = enveloped(z.array(facilityOptionDtoSchema));
