import { useMutation } from "@tanstack/react-query";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import { sessionStore } from "@/lib/utils/local-storage";

export const useLogout = () =>
    useMutation({
        mutationFn: () => local.delete(apiRoutes.session()),
        onSuccess: () => sessionStore.clear(),
    });
