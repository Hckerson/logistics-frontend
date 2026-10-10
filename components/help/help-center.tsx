"use client";
import { useEffect, useId, useState, type ReactNode } from "react";
import HelpEmpty from "@/components/help/help-empty";
import HelpEscalation from "@/components/help/help-escalation";
import HelpNav from "@/components/help/help-nav";
import HelpSearchField from "@/components/help/help-search-field";
import HelpShelves from "@/components/help/help-shelves";
import { HELP_COPY } from "@/lib/data/help/copy";
import { HELP_QUERY, HELP_SEARCH_DELAY_MS } from "@/lib/help/constants";
import { useDebouncedSearch } from "@/lib/hooks/use-debounced-search";
import { useHelpSearch } from "@/lib/hooks/use-help-search";
import type { HelpShelf } from "@/lib/types";
import { pluralize } from "@/lib/utils/plural";

interface Props {
    initialQuery: string;
    shelves: readonly HelpShelf[];
    children: ReactNode;
}

export default function HelpCenter({ initialQuery, shelves, children }: Props) {
    const id = useId();
    const { search, setSearch, debouncedSearch } = useDebouncedSearch(initialQuery, HELP_SEARCH_DELAY_MS);
    const [active, setActive] = useState(initialQuery !== "");
    const query = search.trim() === "" ? "" : debouncedSearch.trim();
    const help = useHelpSearch(query, active);
    const searching = query !== "" && help.ready;
    const found = help.results.reduce((count, shelf) => count + shelf.articles.length, 0);
    const clear = () => setSearch("");

    useEffect(() => {
        const url = new URL(window.location.href);
        if (query) url.searchParams.set(HELP_QUERY, query);
        else url.searchParams.delete(HELP_QUERY);
        window.history.replaceState(window.history.state, "", url);
    }, [query]);

    return (
        <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16 xl:gap-24">
            <aside className="flex flex-col gap-8 lg:sticky lg:top-[calc(var(--haulr-header)+2rem)] lg:self-start">
                <HelpNav shelves={shelves} onPick={clear} />
                <HelpEscalation context={{ q: query || undefined }} />
            </aside>
            <div className="flex min-w-0 flex-col gap-8">
                <HelpSearchField id={id} value={search} unavailable={help.failed} onChange={setSearch} onFocus={() => setActive(true)} />
                <p aria-live="polite" className="haulr-label text-text-muted empty:hidden">
                    {searching ? pluralize(found, HELP_COPY.results.count) : ""}
                </p>
                {!searching ? children : found > 0 ? <HelpShelves shelves={help.results} /> : <HelpEmpty query={query} shelves={shelves} onPick={clear} />}
            </div>
        </div>
    );
}
