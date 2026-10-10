import { useMutation } from "@tanstack/react-query";
import { sendArticleFeedback } from "@/lib/actions/send-article-feedback";
import type { ArticleFeedback } from "@/lib/types";

export const useArticleFeedback = () =>
    useMutation({
        mutationFn: (feedback: ArticleFeedback) => sendArticleFeedback(feedback),
    });
