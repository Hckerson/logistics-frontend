"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "@carbon/icons-react";
import AccountStandingNotice from "@/components/common/account-standing-notice";
import LoadBoardEmpty from "@/components/common/load-board-empty";
import LoadBoardMap from "@/components/common/load-board-map";
import LoadBoardResults from "@/components/common/load-board-results";
import LoadBoardSearch from "@/components/common/load-board-search";
import SectionFailure from "@/components/common/section-failure";
import UpdatedAge from "@/components/common/updated-age";
import ProgressLine from "@/components/ui/progress-line";
import SegmentedControl from "@/components/ui/segmented-control";
import Skeleton from "@/components/ui/skeleton";
import { QUIET_LINK } from "@/lib/auth/constants";
import { LOAD_BOARD_COPY } from "@/lib/data/load-board/copy";
import { useLoadBoard } from "@/lib/hooks/use-load-board";
import { useWide } from "@/lib/hooks/use-wide";
import { LOAD_BOARD } from "@/lib/load-board/constants";
import { boardHref } from "@/lib/load-board/search";
import type { BoardSearch, BoardView, LoadBoardQuery } from "@/lib/types";
import { failureFrom } from "@/lib/utils/action-result";
import { pluralize } from "@/lib/utils/plural";

interface Props {
    initial: BoardSearch;
}

const { results, view: viewCopy } = LOAD_BOARD_COPY;
const same = (one: LoadBoardQuery, other: LoadBoardQuery) => JSON.stringify(one) === JSON.stringify(other);

export default function LoadBoard({ initial }: Props) {
    const router = useRouter();
    const wide = useWide();
    const [query, setQuery] = useState(initial.query);
    const [draft, setDraft] = useState(initial.query);
    const [view, setView] = useState<BoardView>(initial.view);
    const [limit, setLimit] = useState<number>(LOAD_BOARD.pageSize);
    const board = useLoadBoard({ ...query, limit });
    const failure = board.isError ? failureFrom(board.error) : null;
    const page = board.data;

    const apply = (next: LoadBoardQuery, shown: BoardView = view) => {
        setQuery(next);
        setDraft(next);
        setLimit(LOAD_BOARD.pageSize);
        router.replace(boardHref(next, shown, initial.next), { scroll: false });
    };

    useEffect(() => {
        if (!wide || same(draft, query)) return;
        const timer = setTimeout(() => {
            setQuery(draft);
            setLimit(LOAD_BOARD.pageSize);
            router.replace(boardHref(draft, view, initial.next), { scroll: false });
        }, LOAD_BOARD.searchDebounceMs);
        return () => clearTimeout(timer);
    }, [draft, query, wide, view, initial.next, router]);

    return (
        <div className="flex flex-col gap-5">
            {initial.next ? (
                <Link href={initial.next} className={`${QUIET_LINK} inline-flex min-h-11 items-center gap-1.5 self-start`}>
                    <ArrowLeft aria-hidden className="size-4" />
                    {LOAD_BOARD_COPY.back}
                </Link>
            ) : null}
            <AccountStandingNotice capabilities={["book"]} />
            <LoadBoardSearch wide={wide} draft={draft} onDraft={setDraft} onApply={() => apply(draft)} onClear={() => apply({})} />
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p aria-live="polite" className="flex flex-wrap items-baseline gap-x-3 text-xs">
                    <span className="text-text">{page ? pluralize(page.total, results.count) : ""}</span>
                    {page ? <span className="text-text-muted">{results.sorted}</span> : null}
                    {page ? (
                        <span className="text-text-muted">
                            <UpdatedAge at={board.dataUpdatedAt} template={results.checked} />
                        </span>
                    ) : null}
                </p>
                <SegmentedControl label={viewCopy.label} options={viewCopy.options} value={view} size="sm" onChange={(next) => {
                    setView(next);
                    router.replace(boardHref(query, next, initial.next), { scroll: false });
                }} />
            </div>
            {board.isFetching && page ? <ProgressLine className="bg-border" /> : null}
            {failure?.errorClass === "validation" ? <p role="alert" className="text-error text-xs">{results.unknownPlace}</p> : null}
            {failure && failure.errorClass !== "validation" ? <SectionFailure label={results.label} failure={failure} onRetry={() => board.refetch()} /> : null}
            {!page && board.isPending ? <Skeleton className="h-72" /> : null}
            {page && page.items.length === 0 ? <LoadBoardEmpty query={query} onChange={(next) => apply(next)} /> : null}
            {page && page.items.length > 0 && view === "list" ? (
                <LoadBoardResults items={page.items} more={page.nextCursor !== null} pending={board.isFetching} back={boardHref(query, view, initial.next)} onMore={() => setLimit(limit + LOAD_BOARD.pageSize)} />
            ) : null}
            {page && page.items.length > 0 && view === "map" ? <LoadBoardMap items={page.items} origin={page.origin} /> : null}
        </div>
    );
}
