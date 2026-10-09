import { useMutation } from "@tanstack/react-query";
import { resendVerification } from "@/lib/actions/verify-email";

export const useResendVerification = () =>
    useMutation({
        mutationFn: () => resendVerification(),
    });
