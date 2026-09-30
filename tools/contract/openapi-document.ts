import { z } from "zod";

export interface JsonSchema {
    $ref?: string;
    type?: string;
    format?: string;
    enum?: (string | number)[];
    items?: JsonSchema;
    properties?: Record<string, JsonSchema>;
    required?: string[];
    nullable?: boolean;
    allOf?: JsonSchema[];
}

const jsonSchema: z.ZodType<JsonSchema> = z.lazy(() =>
    z.object({
        $ref: z.string().optional(),
        type: z.string().optional(),
        format: z.string().optional(),
        enum: z.array(z.union([z.string(), z.number()])).optional(),
        items: jsonSchema.optional(),
        properties: z.record(z.string(), jsonSchema).optional(),
        required: z.array(z.string()).optional(),
        nullable: z.boolean().optional(),
        allOf: z.array(jsonSchema).optional(),
    }),
);

const mediaType = z.object({ schema: jsonSchema.optional() });

const response = z.object({
    content: z.record(z.string(), mediaType).optional(),
});

const parameter = z.object({
    name: z.string(),
    in: z.string(),
    required: z.boolean().optional(),
    schema: jsonSchema.optional(),
});

export type Parameter = z.infer<typeof parameter>;

const operation = z.object({
    operationId: z.string().optional(),
    parameters: z.array(parameter).optional(),
    responses: z.record(z.string(), response).optional(),
});

export type Operation = z.infer<typeof operation>;

export const openApiDocument = z.object({
    paths: z.record(z.string(), z.record(z.string(), operation)),
    components: z
        .object({ schemas: z.record(z.string(), jsonSchema).optional() })
        .optional(),
});

export type OpenApiDocument = z.infer<typeof openApiDocument>;
