import type { Metadata } from "next";
import PageIntro from "@/components/common/page-intro";
import SupportDesk from "@/components/support/support-desk";
import SupportHours from "@/components/support/support-hours";
import TicketHistory from "@/components/support/ticket-history";
import { SUPPORT_COPY } from "@/lib/data/support/copy";
import { findArticle } from "@/lib/help/library";
import { contextLines, supportContextFrom, ticketPrefill } from "@/lib/support/context";
import { getSession } from "@/lib/utils/session";

interface Props {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = { title: SUPPORT_COPY.meta.title };

export default async function SupportPage({ searchParams }: Props) {
    const [params, session] = await Promise.all([searchParams, getSession()]);
    const context = supportContextFrom(params);
    const article = context.article ? findArticle(context.article) : null;

    return (
        <div className="haulr-shell flex flex-col gap-10 pt-[calc(var(--haulr-header)+3rem)] pb-20 lg:gap-14 lg:pt-[calc(var(--haulr-header)+5rem)]">
            <PageIntro eyebrow={SUPPORT_COPY.eyebrow} title={SUPPORT_COPY.title} lead={SUPPORT_COPY.lead} />
            <div className="grid gap-10 lg:grid-cols-[minmax(0,42rem)_17rem] lg:gap-16 xl:gap-24">
                <SupportDesk
                    replyTo={session?.email ?? null}
                    context={context}
                    prefill={ticketPrefill(context, article)}
                    lines={contextLines(context, article)}
                />
                <aside className="flex flex-col gap-10 lg:sticky lg:top-[calc(var(--haulr-header)+2rem)] lg:self-start">
                    <SupportHours />
                    <TicketHistory signedIn={session !== null} />
                </aside>
            </div>
        </div>
    );
}
