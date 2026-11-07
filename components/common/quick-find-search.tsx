"use client";
import { useRouter } from "next/navigation";
import { Autocomplete, Header, ListBox, ListBoxSection, type Key } from "react-aria-components";
import SectionFailure from "@/components/common/section-failure";
import ListOption from "@/components/ui/list-option";
import ProgressLine from "@/components/ui/progress-line";
import SearchField from "@/components/ui/search-field";
import { useSession } from "@/components/providers/session-provider";
import { SHELL_COPY } from "@/lib/data/shell";
import { LOADING_SLOW_MS } from "@/lib/errors/constants";
import { useConnectivity } from "@/lib/hooks/use-connectivity";
import { useDebouncedSearch } from "@/lib/hooks/use-debounced-search";
import { useQuickFind } from "@/lib/hooks/use-quick-find";
import { useRecentSearches } from "@/lib/hooks/use-recent-searches";
import { useSlow } from "@/lib/hooks/use-slow";
import { appRoutes } from "@/lib/app-routes";
import { LOAD_REFERENCE, QUICK_FIND } from "@/lib/loads/constants";
import { quickFindTargets } from "@/lib/loads/quick-find";
import { failureFrom } from "@/lib/utils/action-result";
import { fillTemplate } from "@/lib/utils/fill-template";
import { pluralize } from "@/lib/utils/plural";

interface Props {
    onDone: () => void;
}

const { quickFind: copy } = SHELL_COPY;
const RECENT = "recent:";
const HEADER = "haulr-label text-text-muted px-3 pt-2.5 pb-1";

export default function QuickFindSearch({ onDone }: Props) {
    const router = useRouter();
    const owner = useSession()?.id ?? "";
    const offline = useConnectivity().state === "offline";
    const { search, setSearch, debouncedSearch } = useDebouncedSearch("", QUICK_FIND.debounceMs);
    const term = debouncedSearch.trim();
    const found = useQuickFind(term);
    const slow = useSlow(found.isFetching, LOADING_SLOW_MS);
    const { recent, remember } = useRecentSearches(owner);
    const typed = search.trim();
    const short = typed.length < QUICK_FIND.min;
    const groups = short || !found.data ? [] : quickFindTargets(found.data);
    const total = groups.reduce((sum, group) => sum + group.total, 0);
    const settled = !short && found.isSuccess && !found.isFetching && term === typed;

    const go = (href: string, label: string) => {
        remember(label);
        onDone();
        router.push(href);
    };

    const act = (key: Key) => {
        const id = String(key);
        const target = groups.flatMap((group) => group.items).find((item) => item.key === id);
        if (target) go(target.href, target.label);
        else if (id.startsWith(RECENT)) setSearch(id.slice(RECENT.length));
    };

    const submit = (value: string) => {
        const reference = value.trim().toUpperCase();
        if (LOAD_REFERENCE.test(reference)) go(appRoutes.load(reference), reference);
    };

    const empty = () => {
        if (offline) return copy.offline;
        if (short) return typed ? copy.short : copy.hint;
        return settled ? fillTemplate(copy.none, { term: typed }) : "";
    };

    return (
        <Autocomplete inputValue={search} onInputChange={setSearch}>
            <div className="flex flex-col gap-2">
                <SearchField label={copy.label} value={search} onChange={setSearch} onSubmit={submit} placeholder={copy.placeholder} autoFocus />
                <div className="relative">
                    {found.isFetching && !short ? <ProgressLine className="bg-border absolute inset-x-0 top-0" /> : null}
                    <ListBox
                        aria-label={copy.results}
                        aria-busy={found.isFetching || undefined}
                        onAction={act}
                        renderEmptyState={() => <p className="text-text-muted px-3 py-3 text-xs empty:hidden">{empty()}</p>}
                        className="-mx-4 max-h-80 overflow-y-auto outline-none"
                    >
                        {short && !offline && recent.length > 0 ? (
                            <ListBoxSection>
                                <Header className={HEADER}>{copy.recent}</Header>
                                {recent.map((entry) => (
                                    <ListOption key={entry} id={`${RECENT}${entry}`} label={entry} />
                                ))}
                            </ListBoxSection>
                        ) : null}
                        {groups.map((group) => (
                            <ListBoxSection key={group.type}>
                                <Header className={HEADER}>{`${copy.groups[group.type]} · ${group.total}`}</Header>
                                {group.items.map((item) => (
                                    <ListOption key={item.key} id={item.key} label={item.label} detail={item.detail} />
                                ))}
                            </ListBoxSection>
                        ))}
                    </ListBox>
                </div>
                {found.isError && !short ? <SectionFailure label={copy.title} failure={failureFrom(found.error)} onRetry={() => found.refetch()} /> : null}
                <p role="status" className="text-text-muted text-xs empty:hidden">
                    {slow ? copy.slow : settled && total > 0 ? pluralize(total, copy.found) : ""}
                </p>
            </div>
        </Autocomplete>
    );
}
