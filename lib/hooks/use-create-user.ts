import { useMutation } from "@tanstack/react-query";
import { createUser } from "@/lib/actions/create-user";
import type { CreateUserDto } from "@/lib/contract/schemas";

export const useCreateUser = () =>
    useMutation({
        mutationFn: async (input: CreateUserDto) => {
            const result = await createUser(input);
            if (!result.ok) throw new Error(result.message);
            return result.data;
        },
    });
