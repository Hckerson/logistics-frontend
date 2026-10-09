import { describe, expect, it } from "vitest";
import { unpublishedRoutes } from "@/lib/api-routes";
import { routes } from "@/lib/contract/routes";
import { MOCK_USERS } from "@/lib/data/mocks/users";
import { mockRequest } from "@/lib/mocks/router";

const [user] = MOCK_USERS;
const send = (method: string, path: string, body: unknown = null) => mockRequest({ method, path, body }, 0);

describe("mock backend", () => {
    it("signs in a seeded account with the backend envelope", async () => {
        const response = await send("POST", routes.authLogin(), { email: user.email, password: user.password });
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ statusCode: 200, message: "Success", data: { user: { email: user.email } } });
    });

    it("rejects a wrong password with the error envelope", async () => {
        const response = await send("POST", routes.authLogin(), { email: user.email, password: "wrong-password" });
        expect(response.status).toBe(401);
        expect(response.body).toMatchObject({ statusCode: 401, error: "UnauthorizedException" });
    });

    it("registers a new account once and refuses the same email twice", async () => {
        const account = { fullName: "Ada Mensah", email: "ada@haulr.test", password: "longhaul88" };
        expect((await send("POST", routes.authRegister(), account)).status).toBe(201);
        expect((await send("POST", routes.authRegister(), account)).status).toBe(409);
    });

    it("plays the rate-limit scenario with Retry-After", async () => {
        const response = await send("POST", routes.authLogin(), { email: "busy@haulr.test", password: "anything1" });
        expect(response.status).toBe(429);
        expect(response.headers?.["Retry-After"]).toBe("120");
    });

    it("accepts a reset request the same way whether or not the account exists", async () => {
        const known = await send("POST", unpublishedRoutes.passwordReset(), { email: user.email });
        const unknown = await send("POST", unpublishedRoutes.passwordReset(), { email: "nobody@haulr.test" });
        expect(known.status).toBe(202);
        expect(unknown.status).toBe(202);
        expect((known.body as { data: unknown }).data).toEqual((unknown.body as { data: unknown }).data);
    });

    it("answers unknown routes with a 404 naming the missing mock", async () => {
        const response = await send("GET", "/api/nowhere");
        expect(response.status).toBe(404);
        expect(response.body).toMatchObject({ message: "No mock handler for GET /api/nowhere" });
    });
});
