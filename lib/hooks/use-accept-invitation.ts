import { useMutation } from "@tanstack/react-query";
import { acceptInvitation } from "@/lib/actions/accept-invitation";

interface Input {
    token: string;
    newcomer?: { fullName: string; password: string };
}

export const useAcceptInvitation = () =>
    useMutation({
        mutationFn: ({ token, newcomer }: Input) => acceptInvitation(token, newcomer),
    });
