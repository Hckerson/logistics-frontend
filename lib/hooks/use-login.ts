import { useMutation } from "@tanstack/react-query";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import type { LoginDto } from "@/lib/contract/schemas";
import type { SessionReply } from "@/lib/types";

export const useLogin = () =>
    useMutation({
        mutationFn: (input: LoginDto) => local.post<SessionReply>(apiRoutes.session(), input),
    });
