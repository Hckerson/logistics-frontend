import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import type { UserResponseDto } from "@/lib/contract/schemas";
import { routes } from "@/lib/contract/routes";
import type { ApiResponse } from "@/lib/types/api";
import { query } from "./api-client";

const transport = vi.hoisted(() => ({
    request: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    interceptors: { response: { use: vi.fn() } },
}));

vi.mock("axios", () => ({ default: { create: () => transport } }));

const envelope = <T>(data: T): ApiResponse<T> => ({
    statusCode: 200,
    message: "Success",
    timestamp: "2026-09-06T00:00:00.000Z",
    data,
});

beforeEach(() => {
    transport.request.mockReset();
});

describe("browser transport", () => {
    it("rejects a failed request instead of fabricating a success", async () => {
        transport.request.mockRejectedValue(new Error("network is down"));

        await expect(query.get(routes.usersFindAll())).rejects.toThrow(
            "network is down",
        );
    });

    it("returns the envelope the backend actually sent", async () => {
        const users = [{ id: "user-1" }] as UserResponseDto[];
        transport.request.mockResolvedValue({ data: envelope(users) });

        const response = await query.get(routes.usersFindAll());

        expect(response.data).toEqual(users);
        expect(response.statusCode).toBe(200);
    });

    it("passes the method and url straight through", async () => {
        transport.request.mockResolvedValue({ data: envelope(null) });

        await query.delete(routes.usersRemove("user-1"));

        expect(transport.request).toHaveBeenCalledWith(
            expect.objectContaining({
                method: "DELETE",
                url: "/api/users/user-1",
            }),
        );
    });

    it("infers the response type carried by the endpoint", () => {
        const findOne = () => query.get(routes.usersFindOne("user-1"));
        const findAll = () => query.get(routes.usersFindAll());

        expectTypeOf(findOne).returns.resolves.toEqualTypeOf<
            ApiResponse<UserResponseDto>
        >();
        expectTypeOf(findAll).returns.resolves.toEqualTypeOf<
            ApiResponse<UserResponseDto[]>
        >();
    });
});
