"use server";
import { z } from "zod";
import { backendFetch, readJson } from "@/lib/api-server";
import { REQUEST_FAILED } from "@/lib/constants";
import { routes } from "@/lib/contract/routes";
import {
    apiEnvelopeDtoSchema,
    createUserDtoSchema,
    userResponseDtoSchema,
    type CreateUserDto,
    type UserResponseDto,
} from "@/lib/contract/schemas";
import type { ActionResult } from "@/lib/types/api";
import { contractFailure, failureOf, invalidInput } from "@/lib/utils/action-result";
import { withAction } from "@/lib/utils/with-action";

const createdSchema = apiEnvelopeDtoSchema.extend({
    data: userResponseDtoSchema,
});

const refusalSchema = z.object({
    message: z.union([z.string(), z.array(z.string())]),
});

const refusalMessage = (body: unknown): string => {
    const refusal = refusalSchema.safeParse(body);
    if (!refusal.success) return REQUEST_FAILED;

    const { message } = refusal.data;
    return Array.isArray(message) ? message.join(", ") : message;
};

export const createUser = withAction(async (_context, input: CreateUserDto): Promise<ActionResult<UserResponseDto>> => {
    const parsed = createUserDtoSchema.safeParse(input);
    if (!parsed.success) return invalidInput();

    const upstream = await backendFetch(routes.usersCreate(), {
        method: "POST",
        body: JSON.stringify(parsed.data),
    });
    const body = await readJson(upstream);
    if (!upstream.ok) return failureOf(upstream.status, { message: refusalMessage(body) });

    const created = createdSchema.safeParse(body);
    return created.success ? { ok: true, data: created.data.data } : contractFailure();
});
