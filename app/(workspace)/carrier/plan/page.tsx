import type { Metadata } from "next";
import DispatchBoard from "@/components/common/dispatch-board";
import WorkspaceHeading from "@/components/common/workspace-heading";
import WorkspacePage from "@/components/common/workspace-page";
import { FLEET_COPY } from "@/lib/data/fleet/copy";
import { parsePlanSearch } from "@/lib/fleet/plan-search";

interface Props {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = { title: FLEET_COPY.meta, robots: { index: false, follow: false } };

export default async function DispatchBoardPage({ searchParams }: Props) {
    const initial = parsePlanSearch(await searchParams);

    return (
        <WorkspacePage>
            <WorkspaceHeading title={FLEET_COPY.title} />
            <DispatchBoard initial={initial} />
        </WorkspacePage>
    );
}
