import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "@/lib/actions/reset-password";

interface Input {
    token: string;
    password: string;
}

export const useResetPassword = () =>
    useMutation({
        mutationFn: ({ token, password }: Input) => resetPassword(token, password),
    });
