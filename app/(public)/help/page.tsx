import type { Metadata } from "next";
import PageIntro from "@/components/common/page-intro";
import HelpCenter from "@/components/help/help-center";
import HelpShelves from "@/components/help/help-shelves";
import PublicPage from "@/components/common/public-page";
import { HELP_COPY } from "@/lib/data/help/copy";
import { HELP_SHELVES } from "@/lib/help/library";

interface Props {
    searchParams: Promise<{ q?: string | string[] }>;
}

export const metadata: Metadata = { title: HELP_COPY.meta.title };

export default async function HelpPage({ searchParams }: Props) {
    const { q } = await searchParams;

    return (
        <PublicPage>
            <PageIntro eyebrow={HELP_COPY.eyebrow} title={HELP_COPY.title} lead={HELP_COPY.lead} />
            <HelpCenter initialQuery={typeof q === "string" ? q : ""} shelves={HELP_SHELVES}>
                <HelpShelves shelves={HELP_SHELVES} />
            </HelpCenter>
        </PublicPage>
    );
}
