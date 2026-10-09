import type { ActionFailure, AuthSignal, FormProblem, VerifyStatus } from "@/lib/types";
import { requestFailure } from "@/lib/auth/problems";
import { HTTP_STATUS } from "@/lib/constants";
import { VERIFY_COPY } from "@/lib/data/auth/verify";

const DEAD_LINK: readonly number[] = [HTTP_STATUS.badRequest, HTTP_STATUS.notFound];

export const VERIFY_SIGNAL: Record<VerifyStatus, AuthSignal> = {
    inbox: "midway",
    verifying: "pending",
    verified: "arrived",
    already: "arrived",
    expired: "held",
    failed: "held",
};

export const verifyOutcome = ({ status }: ActionFailure): VerifyStatus =>
    status === HTTP_STATUS.conflict ? "already" : DEAD_LINK.includes(status) ? "expired" : "failed";

export const resendFailure = (failure: ActionFailure): FormProblem =>
    failure.status === HTTP_STATUS.unauthorized ? VERIFY_COPY.signIn : requestFailure(failure);
