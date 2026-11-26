import type { Metadata } from "next";
import { ArrowLeft } from "@carbon/icons-react";
import PostLoad from "@/components/common/post-load";
import WorkspaceHeading from "@/components/common/workspace-heading";
import WorkspacePage from "@/components/common/workspace-page";
import ButtonLink from "@/components/ui/button-link";
import { appRoutes } from "@/lib/app-routes";
import { CAPABILITY_ROLES } from "@/lib/auth/capabilities";
import { requireRoles } from "@/lib/auth/guards";
import { POST_COPY } from "@/lib/data/loads/post-copy";
import { readFacilities, readPostStart } from "@/lib/loads/post-read";
import { postSearchOf } from "@/lib/loads/post-start";

interface Props {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = { title: POST_COPY.meta.title, robots: { index: false, follow: false } };

export default async function PostLoadPage({ searchParams }: Props) {
    const user = await requireRoles(CAPABILITY_ROLES.postLoads);
    const search = await searchParams;
    const facilities = await readFacilities();
    const start = await readPostStart(search, facilities);

    return (
        <WorkspacePage>
            <WorkspaceHeading title={POST_COPY.title}>
                <ButtonLink href={appRoutes.shipments()} tone="outline" icon={ArrowLeft}>
                    {POST_COPY.shipments}
                </ButtonLink>
            </WorkspaceHeading>
            <PostLoad userId={user.id} start={start} requested={postSearchOf(search).step} facilities={facilities} />
        </WorkspacePage>
    );
}
