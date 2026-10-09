import { useMutation } from "@tanstack/react-query";
import { answerMfaChallenge } from "@/lib/actions/mfa-challenge";
import type { MfaAnswer } from "@/lib/types";

export const useMfaChallenge = () =>
    useMutation({
        mutationFn: (answer: MfaAnswer) => answerMfaChallenge(answer),
    });
