import type { Metadata } from "next";
import LoadBoard from "@/components/common/load-board";
import WorkspaceHeading from "@/components/common/workspace-heading";
import WorkspacePage from "@/components/common/workspace-page";
import { LOAD_BOARD_COPY } from "@/lib/data/load-board/copy";
import { parseBoardSearch } from "@/lib/load-board/search";

interface Props {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = { title: LOAD_BOARD_COPY.meta, robots: { index: false, follow: false } };

export default async function LoadBoardPage({ searchParams }: Props) {
    const initial = parseBoardSearch(await searchParams);

    return (
        <WorkspacePage>
            <WorkspaceHeading title={LOAD_BOARD_COPY.title} />
            <LoadBoard initial={initial} />
        </WorkspacePage>
    );
}
