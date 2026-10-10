import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegalDocument from "@/components/legal/legal-document";
import { LEGAL_COPY } from "@/lib/data/legal/copy";
import { findEdition, legalParams } from "@/lib/legal/edition";

interface Props {
    params: Promise<{ document: string; version?: string[] }>;
}

const { meta } = LEGAL_COPY;

export const generateStaticParams = legalParams;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { document, version } = await params;
    const found = findEdition(document, version);
    if (!found) return {};
    const { title, summary } = found.document;
    if (!found.replacedBy) return { title: meta.title.replace("{title}", title), description: summary };
    return {
        title: meta.version.replace("{title}", title).replace("{version}", found.edition.version),
        robots: { index: false },
    };
}

export default async function LegalPage({ params }: Props) {
    const { document, version } = await params;
    const found = findEdition(document, version);
    if (!found) notFound();

    return <LegalDocument found={found} />;
}
