import type { Metadata } from "next";
import FleetRoster from "@/components/common/fleet-roster";
import WorkspaceHeading from "@/components/common/workspace-heading";
import WorkspacePage from "@/components/common/workspace-page";
import { ROSTER_COPY } from "@/lib/data/fleet/roster-copy";
import { parseRosterSearch } from "@/lib/fleet/roster";

interface Props {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = { title: ROSTER_COPY.meta, robots: { index: false, follow: false } };

export default async function FleetPage({ searchParams }: Props) {
    const initial = parseRosterSearch(await searchParams);

    return (
        <WorkspacePage>
            <WorkspaceHeading title={ROSTER_COPY.title} />
            <FleetRoster initial={initial} />
        </WorkspacePage>
    );
}
