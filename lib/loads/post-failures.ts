import { POST_COPY } from "@/lib/data/loads/post-copy";
import { ERROR_COPY } from "@/lib/errors/constants";
import { errorMessage, failureFrom } from "@/lib/utils/action-result";

export const saveFailureText = (error: unknown) => {
    const failure = failureFrom(error);
    if (!failure) return navigator.onLine ? ERROR_COPY.server : POST_COPY.offline;
    return failure.errorClass === "offline" ? POST_COPY.offline : errorMessage(failure);
};
