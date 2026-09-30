import { useMutation } from "@tanstack/react-query";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import type { AuthResponseUserDto, LoginDto } from "@/lib/contract/schemas";

export const useLogin = () =>
    useMutation({
        mutationFn: (input: LoginDto) =>
            local.post<{ user: AuthResponseUserDto }>(
                apiRoutes.session(),
                input,
            ),
    });
