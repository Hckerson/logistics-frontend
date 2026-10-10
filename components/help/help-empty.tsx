import ConsoleLink from "@/components/auth/console-link";
import { supportRoute } from "@/lib/constants";
import { HELP_COPY } from "@/lib/data/help/copy";
import type { HelpShelf } from "@/lib/types";

interface Props {
    query: string;
    shelves: readonly HelpShelf[];
    onPick: () => void;
}

const { results, escalation } = HELP_COPY;

export default function HelpEmpty({ query, shelves, onPick }: Props) {
    return (
        <div className="border-border flex max-w-xl flex-col gap-6 border-l-2 py-1 pl-5">
            <div className="flex flex-col gap-1.5">
                <p className="text-text text-sm font-medium">{results.none.replace("{query}", query)}</p>
                <p className="text-text-muted text-sm">{results.hint}</p>
            </div>
            <div className="flex flex-col gap-2">
                <p className="haulr-label text-text-muted">{results.topics}</p>
                <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {shelves.map(({ category }) => (
                        <li key={category.key}>
                            <a href={`#${category.key}`} onClick={onPick} className="text-text-secondary hover:text-text text-xs underline-offset-4 hover:underline">
                                {category.title}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
            <ConsoleLink href={supportRoute({ q: query })} label={escalation.action} />
        </div>
    );
}
