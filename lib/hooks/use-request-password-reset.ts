import { useMutation } from "@tanstack/react-query";
import { requestPasswordReset } from "@/lib/actions/request-password-reset";

export const useRequestPasswordReset = () =>
    useMutation({
        mutationFn: (email: string) => requestPasswordReset(email),
    });
