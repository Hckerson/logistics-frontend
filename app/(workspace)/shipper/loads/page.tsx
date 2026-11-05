import type { Metadata } from "next";
import { Add } from "@carbon/icons-react";
import ShipmentsBoard from "@/components/common/shipments-board";
import WorkspaceHeading from "@/components/common/workspace-heading";
import WorkspacePage from "@/components/common/workspace-page";
import ButtonLink from "@/components/ui/button-link";
import { appRoutes } from "@/lib/app-routes";
import { SHIPMENTS_COPY } from "@/lib/data/loads/shipments";
import { shipmentSearchSchema } from "@/lib/validations/shipments";

interface Props {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = { title: SHIPMENTS_COPY.meta.title, robots: { index: false, follow: false } };

export default async function ShipmentsPage({ searchParams }: Props) {
    const initial = shipmentSearchSchema.parse(await searchParams);

    return (
        <WorkspacePage>
            <WorkspaceHeading title={SHIPMENTS_COPY.title}>
                <ButtonLink href={appRoutes.postLoad()} icon={Add}>
                    {SHIPMENTS_COPY.post}
                </ButtonLink>
            </WorkspaceHeading>
            <ShipmentsBoard initial={initial} />
        </WorkspacePage>
    );
}
