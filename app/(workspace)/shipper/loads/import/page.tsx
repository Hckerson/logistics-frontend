import type { Metadata } from "next";
import { forbidden } from "next/navigation";
import { ArrowLeft } from "@carbon/icons-react";
import ImportBoard from "@/components/common/import-board";
import WorkspaceHeading from "@/components/common/workspace-heading";
import WorkspacePage from "@/components/common/workspace-page";
import ButtonLink from "@/components/ui/button-link";
import { appRoutes } from "@/lib/app-routes";
import { IMPORT_COPY } from "@/lib/data/loads/import-copy";
import { readFlags } from "@/lib/flags";
import { importBatchParam } from "@/lib/loads/imports";

interface Props {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = { title: IMPORT_COPY.meta.title, robots: { index: false, follow: false } };

export default async function ImportLoadsPage({ searchParams }: Props) {
    if (!readFlags().bulkImport) forbidden();
    const batchId = importBatchParam(await searchParams);

    return (
        <WorkspacePage>
            <WorkspaceHeading title={IMPORT_COPY.title}>
                <ButtonLink href={appRoutes.shipments()} tone="outline" icon={ArrowLeft}>
                    {IMPORT_COPY.shipments}
                </ButtonLink>
            </WorkspaceHeading>
            <ImportBoard initial={batchId} />
        </WorkspacePage>
    );
}
