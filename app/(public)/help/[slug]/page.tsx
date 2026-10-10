import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HelpArticle from "@/components/help/help-article";
import { HELP_COPY } from "@/lib/data/help/copy";
import { categoryOf, findArticle, helpParams, relatedTo } from "@/lib/help/library";

interface Props {
    params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export const generateStaticParams = helpParams;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const article = findArticle((await params).slug);
    return article ? { title: HELP_COPY.meta.article.replace("{title}", article.title), description: article.summary } : {};
}

export default async function HelpArticlePage({ params }: Props) {
    const article = findArticle((await params).slug);
    if (!article) notFound();

    return <HelpArticle article={article} category={categoryOf(article.category)} related={relatedTo(article)} />;
}
