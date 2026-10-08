import LaneQuote from "@/components/home/lane-quote";
import { CLOSE_COPY } from "@/lib/data/home/close";
import { PRICE_SECTION_ID } from "@/lib/home/constants";

export default function QuoteClose() {
    return (
        <section
            id={PRICE_SECTION_ID}
            aria-labelledby="price-title"
            className="haulr-section scroll-mt-(--haulr-header)"
        >
            <div className="haulr-shell flex flex-col gap-14">
                <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="flex flex-col gap-5">
                        <p className="haulr-label text-accent">{CLOSE_COPY.label}</p>
                        <h2 id="price-title" className="haulr-display text-text">
                            {CLOSE_COPY.title}
                        </h2>
                    </div>
                    <div className="flex max-w-sm flex-col gap-2">
                        <p className="text-text-secondary text-(length:--haulr-lead)">{CLOSE_COPY.lead}</p>
                        <p className="haulr-label text-text-muted">{CLOSE_COPY.note}</p>
                    </div>
                </header>
                <LaneQuote />
            </div>
        </section>
    );
}
