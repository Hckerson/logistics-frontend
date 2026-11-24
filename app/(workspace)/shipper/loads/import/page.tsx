import type { Metadata } from "next";
import { forbidden } from "next/navigation";
import { ArrowLeft } from "@carbon/icons-react";
import Breadcrumbs from "@/components/common/breadcrumbs";
import ImportBoard from "@/components/common/import-board";
import WorkspaceHeading from "@/components/common/workspace-heading";
import WorkspacePage from "@/components/common/workspace-page";
import ButtonLink from "@/components/ui/button-link";
import { appRoutes } from "@/lib/app-routes";
import { IMPORT_COPY } from "@/lib/data/loads/import-copy";
import { readFlags } from "@/lib/flags";
import { importBatchParam } from "@/lib/loads/imports";
import { backParam } from "@/lib/navigation/back";
import { importTrail } from "@/lib/navigation/trails";

interface Props {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = { title: IMPORT_COPY.meta.title, robots: { index: false, follow: false } };

export default async function ImportLoadsPage({ searchParams }: Props) {
    if (!readFlags().bulkImport) forbidden();
    const search = await searchParams;
    const batchId = importBatchParam(search);

    return (
        <WorkspacePage>
            <Breadcrumbs trail={importTrail(backParam(search))} current={IMPORT_COPY.title} />
            <WorkspaceHeading title={IMPORT_COPY.title}>
                <ButtonLink href={appRoutes.shipments()} tone="outline" icon={ArrowLeft}>
                    {IMPORT_COPY.shipments}
                </ButtonLink>
            </WorkspaceHeading>
            <ImportBoard initial={batchId} />
        </WorkspacePage>
    );
}
