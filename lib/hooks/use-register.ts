import { useMutation } from "@tanstack/react-query";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import type { AuthResponseUserDto, RegisterDto } from "@/lib/contract/schemas";

export const useRegister = () =>
    useMutation({
        mutationFn: (input: RegisterDto) =>
            local.post<{ user: AuthResponseUserDto }>(
                apiRoutes.register(),
                input,
            ),
    });
