import { describe, expect, it } from "vitest";
import { JsonSchema, openApiDocument } from "./openapi-document";
import {
    responseDataSchema,
    routeBuilder,
    routeKey,
    routesFile,
    schemasFile,
} from "./generate-contract";
import {
    orderByDependency,
    typeExpression,
    zodExpression,
} from "./schema-to-zod";

const envelopeOperation = (operationId: string, data: JsonSchema) => ({
    operationId,
    responses: {
        "200": {
            content: {
                "application/json": {
                    schema: {
                        allOf: [
                            { $ref: "#/components/schemas/ApiEnvelopeDto" },
                            {
                                type: "object",
                                properties: { data },
                                required: ["data"],
                            },
                        ],
                    },
                },
            },
        },
    },
});

describe("schema-to-zod", () => {
    it("marks properties outside required as optional", () => {
        expect(
            zodExpression({
                type: "object",
                properties: { id: { type: "string" }, bio: { type: "string" } },
                required: ["id"],
            }),
        ).toBe('z.object({"id": z.string(),"bio": z.string().optional(),})');
    });

    it("emits enums, arrays, numbers and nullables", () => {
        expect(zodExpression({ type: "string", enum: ["ADMIN", "USER"] })).toBe(
            'z.enum(["ADMIN", "USER"])',
        );
        expect(
            zodExpression({ type: "array", items: { type: "integer" } }),
        ).toBe("z.array(z.number())");
        expect(
            zodExpression({
                type: "object",
                properties: { avatar: { type: "string", nullable: true } },
                required: ["avatar"],
            }),
        ).toBe('z.object({"avatar": z.string().nullable(),})');
    });

    it("references other schemas by their generated const name", () => {
        expect(
            zodExpression({ $ref: "#/components/schemas/CreateUserDto" }),
        ).toBe("createUserDtoSchema");
    });

    it("orders schemas so references are declared first", () => {
        expect(
            orderByDependency({
                Wrapper: {
                    type: "object",
                    properties: { user: { $ref: "#/components/schemas/User" } },
                },
                User: {
                    type: "object",
                    properties: { id: { type: "string" } },
                },
            }),
        ).toEqual(["User", "Wrapper"]);
    });

    it("rejects circular references instead of emitting broken output", () => {
        expect(() =>
            orderByDependency({
                A: { properties: { b: { $ref: "#/components/schemas/B" } } },
                B: { properties: { a: { $ref: "#/components/schemas/A" } } },
            }),
        ).toThrow(/circular/);
    });
});

describe("routes", () => {
    it("derives a resource-prefixed key from the operation id", () => {
        expect(routeKey("UsersController_findOne")).toBe("usersFindOne");
        expect(routeKey("AuthController_login")).toBe("authLogin");
    });

    it("turns path templates into typed builders", () => {
        expect(routeBuilder("/api/users")).toBe(
            '() => "/api/users" as Endpoint<unknown>',
        );
        expect(routeBuilder("/api/users/{id}")).toBe(
            "(id: string) => `/api/users/${id}` as Endpoint<unknown>",
        );
    });

    it("brands a builder with the response type it was given", () => {
        expect(routeBuilder("/api/users", "UserResponseDto[]")).toBe(
            '() => "/api/users" as Endpoint<UserResponseDto[]>',
        );
    });

    it("takes query parameters as one typed argument after path params", () => {
        expect(
            routeBuilder("/api/stats/{scope}", "unknown", [
                {
                    name: "period",
                    in: "query",
                    required: true,
                    schema: { type: "string", enum: ["day", "month"] },
                },
                { name: "date", in: "query", schema: { type: "string" } },
            ]),
        ).toBe(
            '(scope: string, query: { "period": "day" | "month"; "date"?: string }) => `/api/stats/${scope}${queryString(query)}` as Endpoint<unknown>',
        );
    });

    it("makes the query argument optional when every parameter is", () => {
        expect(
            routeBuilder("/api/users", "unknown", [
                { name: "search", in: "query", schema: { type: "string" } },
            ]),
        ).toBe(
            '(query?: { "search"?: string }) => `/api/users${queryString(query)}` as Endpoint<unknown>',
        );
    });

    it("imports the query helper only when a route needs it", () => {
        const withQuery = routesFile({
            "/api/stats": {
                get: {
                    operationId: "StatsController_series",
                    parameters: [{ name: "period", in: "query" }],
                },
            },
        });
        const withoutQuery = routesFile({
            "/api/users/{id}": {
                get: {
                    operationId: "UsersController_findOne",
                    parameters: [{ name: "id", in: "path", required: true }],
                },
            },
        });

        expect(withQuery).toContain("import { queryString }");
        expect(withoutQuery).not.toContain("queryString");
    });

    it("emits one builder per operation", () => {
        const file = routesFile({
            "/api/users": { post: { operationId: "UsersController_create" } },
            "/api/users/{id}": {
                get: { operationId: "UsersController_findOne" },
            },
        });

        expect(file).toContain(
            'usersCreate: () => "/api/users" as Endpoint<unknown>,',
        );
        expect(file).toContain(
            "usersFindOne: (id: string) => `/api/users/${id}` as Endpoint<unknown>,",
        );
    });

    it("brands each endpoint with its unwrapped response type", () => {
        const file = routesFile({
            "/api/users": {
                get: envelopeOperation("UsersController_findAll", {
                    type: "array",
                    items: { $ref: "#/components/schemas/UserResponseDto" },
                }),
            },
        });

        expect(file).toContain(
            'usersFindAll: () => "/api/users" as Endpoint<UserResponseDto[]>,',
        );
        expect(file).toContain(
            'import type { UserResponseDto } from "./schemas";',
        );
    });

    it("imports the Endpoint brand exactly once", () => {
        const file = routesFile({
            "/api/users": {
                get: envelopeOperation("UsersController_findAll", {
                    $ref: "#/components/schemas/UserResponseDto",
                }),
            },
        });

        expect(
            file.split('import type { Endpoint } from "@/lib/types/api";')
                .length - 1,
        ).toBe(1);
    });
});

describe("responseDataSchema", () => {
    it("unwraps the envelope allOf to reach the data schema", () => {
        expect(
            responseDataSchema(
                envelopeOperation("UsersController_findOne", {
                    $ref: "#/components/schemas/UserResponseDto",
                }),
            ),
        ).toEqual({ $ref: "#/components/schemas/UserResponseDto" });
    });

    it("returns undefined when the operation documents no success body", () => {
        expect(
            responseDataSchema({ operationId: "AppController_getHello" }),
        ).toBeUndefined();
    });

    it("ignores error responses when looking for the success body", () => {
        expect(
            responseDataSchema({
                operationId: "AuthController_login",
                responses: {
                    "401": {
                        content: {
                            "application/json": {
                                schema: { type: "object" },
                            },
                        },
                    },
                },
            }),
        ).toBeUndefined();
    });
});

describe("typeExpression", () => {
    it("names a referenced schema", () => {
        expect(
            typeExpression({ $ref: "#/components/schemas/UserResponseDto" }),
        ).toBe("UserResponseDto");
    });

    it("suffixes arrays and maps primitives", () => {
        expect(
            typeExpression({
                type: "array",
                items: { $ref: "#/components/schemas/UserResponseDto" },
            }),
        ).toBe("UserResponseDto[]");
        expect(typeExpression({ type: "integer" })).toBe("number");
        expect(typeExpression({ type: "object" })).toBe("unknown");
    });

    it("spells an enum as a union of its literals", () => {
        expect(
            typeExpression({ type: "string", enum: ["day", "month", "year"] }),
        ).toBe('"day" | "month" | "year"');
    });
});

describe("schemasFile", () => {
    it("declares a schema const and an inferred type per component", () => {
        const file = schemasFile({
            LoginDto: {
                type: "object",
                properties: { email: { type: "string" } },
                required: ["email"],
            },
        });

        expect(file).toContain('import { z } from "zod";');
        expect(file).toContain(
            'export const loginDtoSchema = z.object({"email": z.string(),});',
        );
        expect(file).toContain(
            "export type LoginDto = z.infer<typeof loginDtoSchema>;",
        );
    });
});

describe("openApiDocument", () => {
    it("rejects a document without paths", () => {
        expect(() => openApiDocument.parse({ components: {} })).toThrow();
    });
});
