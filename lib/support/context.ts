import { SUPPORT_COPY } from "@/lib/data/support/copy";
import type { ContextLine, HelpArticle, SupportContext, TicketDraft } from "@/lib/types";
import { ticketContextUrlSchema } from "@/lib/validations/support";

type Params = Record<string, string | string[] | undefined>;

const { context: labels, prefill } = SUPPORT_COPY;
const single = (value: string | string[] | undefined) => (typeof value === "string" ? value : undefined);

export const supportContextFrom = (params: Params): SupportContext =>
    ticketContextUrlSchema.parse({
        topic: single(params.topic),
        reference: single(params.reference),
        q: single(params.q),
        article: single(params.article),
    });

export const ticketPrefill = (context: SupportContext, article: HelpArticle | null): Pick<TicketDraft, "subject" | "category"> => ({
    subject: article ? prefill.article.replace("{title}", article.title) : (context.q ?? ""),
    category: context.topic ?? null,
});

export const contextLines = (context: SupportContext, article: HelpArticle | null): ContextLine[] =>
    [
        { id: "reference", label: labels.reference, value: context.reference },
        { id: "article", label: labels.article, value: article?.title },
        { id: "q", label: labels.q, value: context.q },
    ].flatMap(({ id, label, value }) => (value ? [{ id, label, value }] : []));
