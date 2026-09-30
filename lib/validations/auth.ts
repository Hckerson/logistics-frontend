import { z } from "zod";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants";
import { loginDtoSchema, registerDtoSchema } from "@/lib/contract/schemas";

const credentials = {
    email: z.string().email(),
    password: z.string().min(PASSWORD_MIN_LENGTH),
};

export const loginSchema = loginDtoSchema.extend(credentials);

export const registerSchema = registerDtoSchema.extend(credentials);
