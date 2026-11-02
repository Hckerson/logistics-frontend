import { describe, expect, it } from "vitest";
import { mergePending } from "./merge-pending";
import type { OpenApiDocument } from "./openapi-document";

const user = { type: "object", properties: { id: { type: "string" } } };
const userWithRoles = {
    type: "object",
    properties: { id: { type: "string" }, roles: { type: "array" } },
};

const backend: OpenApiDocument = {
    paths: {
        "/api/users": { get: { operationId: "UsersController_findAll" } },
    },
    components: { schemas: { UserDto: user, HealthDto: { type: "object" } } },
};

describe("mergePending", () => {
    it("adds pending paths and schemas after the backend's", () => {
        const { document, published } = mergePending(backend, {
            paths: {
                "/api/loads": {
                    get: { operationId: "LoadsController_findAll" },
                },
            },
            components: { schemas: { LoadDto: { type: "object" } } },
        });

        expect(Object.keys(document.paths)).toEqual([
            "/api/users",
            "/api/loads",
        ]);
        expect(Object.keys(document.components?.schemas ?? {})).toEqual([
            "UserDto",
            "HealthDto",
            "LoadDto",
        ]);
        expect(published).toEqual([]);
    });

    it("lets a pending schema amend a published one in place", () => {
        const { document, published } = mergePending(backend, {
            paths: {},
            components: { schemas: { UserDto: userWithRoles } },
        });

        expect(document.components?.schemas).toEqual({
            UserDto: userWithRoles,
            HealthDto: { type: "object" },
        });
        expect(published).toEqual([]);
    });

    it("adds a pending method to a path the backend already serves", () => {
        const { document } = mergePending(backend, {
            paths: {
                "/api/users": {
                    post: { operationId: "UsersController_create" },
                },
            },
        });

        expect(Object.keys(document.paths["/api/users"])).toEqual([
            "get",
            "post",
        ]);
    });

    it("reports pending entries the backend now publishes unchanged", () => {
        const { published } = mergePending(backend, {
            paths: {
                "/api/users": {
                    get: { operationId: "UsersController_findAll" },
                },
            },
            components: { schemas: { UserDto: user } },
        });

        expect(published).toEqual(["GET /api/users", "schema UserDto"]);
    });
});
