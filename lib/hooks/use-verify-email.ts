import { useMutation } from "@tanstack/react-query";
import { verifyEmail } from "@/lib/actions/verify-email";

export const useVerifyEmail = () =>
    useMutation({
        mutationFn: (token: string) => verifyEmail(token),
    });
