import { z } from "zod";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants";
import { loginDtoSchema, registerDtoSchema } from "@/lib/contract/schemas";

const credentials = {
    email: z.string().email(),
    password: z.string().min(PASSWORD_MIN_LENGTH),
};

export const loginSchema = loginDtoSchema.extend(credentials);

export const registerSchema = registerDtoSchema.extend(credentials);

export const signInSchema = loginDtoSchema.extend({
    email: z.string().trim().min(1, "missing").email("invalid"),
    password: z.string().min(1, "missing"),
});
