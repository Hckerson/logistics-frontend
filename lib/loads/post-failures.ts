import { POST_COPY } from "@/lib/data/loads/post-copy";
import { QUOTE_COPY, REVIEW_COPY } from "@/lib/data/loads/post-quote-copy";
import { ERROR_COPY } from "@/lib/errors/constants";
import { windowStarted } from "@/lib/loads/posting";
import type { LaneEntries, PostProblem } from "@/lib/types";
import { errorMessage, failureFrom } from "@/lib/utils/action-result";

const classify = (error: unknown) => {
    const failure = failureFrom(error);
    const errorClass = failure?.errorClass ?? (navigator.onLine ? "server" : "offline");
    return { errorClass, text: failure ? errorMessage(failure) : ERROR_COPY[errorClass] };
};

export const saveFailureText = (error: unknown) => {
    const { errorClass, text } = classify(error);
    return errorClass === "offline" ? POST_COPY.offline : text;
};

export const quoteProblem = (error: unknown, lane: LaneEntries, now: number): PostProblem => {
    const { errorClass, text } = classify(error);
    if (errorClass === "validation") return { text: windowStarted(lane, now) ? QUOTE_COPY.pastWindow : QUOTE_COPY.unserviceable, fix: "lane" };
    if (errorClass === "precondition") return { text: QUOTE_COPY.stale, fix: "retry" };
    return { text: errorClass === "unavailable" ? QUOTE_COPY.unavailable : text, fix: "retry" };
};

export const postProblem = (error: unknown, live: boolean): PostProblem => {
    const { errorClass, text } = classify(error);
    const { errors } = REVIEW_COPY;
    if (errorClass === "conflict") return live ? { text: errors.conflict, fix: null } : { text: errors.expired, fix: "quote" };
    if (errorClass === "validation") return { text: errors.pastWindow, fix: "lane" };
    if (errorClass === "forbidden") return { text: errors.forbidden, fix: "onboarding" };
    if (errorClass === "offline") return { text: errors.offline, fix: null };
    return { text, fix: errorClass === "precondition" ? null : "retry" };
};
