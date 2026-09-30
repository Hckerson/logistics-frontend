import { useMutation } from "@tanstack/react-query";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";

export const useLogout = () =>
    useMutation({
        mutationFn: () => local.delete(apiRoutes.session()),
    });
