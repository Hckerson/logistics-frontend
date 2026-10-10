import { HELP_COPY } from "@/lib/data/help/copy";
import type { HelpShelf } from "@/lib/types";
import { pluralize } from "@/lib/utils/plural";

interface Props {
    shelves: readonly HelpShelf[];
    onPick?: () => void;
}

const { nav } = HELP_COPY;

export default function HelpNav({ shelves, onPick }: Props) {
    return (
        <nav aria-label={nav.label} className="flex flex-col gap-3">
            <p className="haulr-label text-text-muted">{nav.label}</p>
            <ul className="border-border flex flex-col border-l">
                {shelves.map(({ category, articles }) => (
                    <li key={category.key}>
                        <a
                            href={`#${category.key}`}
                            onClick={onPick}
                            className="text-text-secondary hover:text-text hover:border-accent focus-visible:outline-text -ml-px flex items-baseline justify-between gap-3 border-l border-transparent py-1.5 pl-3 text-xs transition-colors focus-visible:outline-2"
                        >
                            <span>{category.title}</span>
                            <span className="text-text-muted tabular-nums">{pluralize(articles.length, nav.count)}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
