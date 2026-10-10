import HelpLink from "@/components/help/help-link";
import type { HelpShelf } from "@/lib/types";
import { twoDigits } from "@/lib/utils/number";

interface Props {
    shelves: readonly HelpShelf[];
}

export default function HelpShelves({ shelves }: Props) {
    return (
        <div className="flex flex-col gap-12">
            {shelves.map(({ category, articles }, index) => (
                <section
                    key={category.key}
                    id={category.key}
                    aria-labelledby={`${category.key}-title`}
                    className="flex scroll-mt-[calc(var(--haulr-header)+2rem)] flex-col gap-4"
                >
                    <div className="flex flex-col gap-1.5">
                        <p className="haulr-label text-text-muted">{twoDigits(index + 1)}</p>
                        <h2 id={`${category.key}-title`} className="text-text text-lg font-medium">
                            {category.title}
                        </h2>
                        <p className="text-text-muted text-sm">{category.summary}</p>
                    </div>
                    <ul className="border-border grid border-t sm:grid-cols-2 sm:gap-x-8">
                        {articles.map((article) => (
                            <li key={article.slug}>
                                <HelpLink article={article} />
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </div>
    );
}
