import LaneForm from "@/components/home/lane-form";
import { CLOSE_COPY } from "@/lib/data/home/close";
import { PRICE_SECTION_ID } from "@/lib/home/constants";

export default function QuoteClose() {
    return (
        <section id={PRICE_SECTION_ID} aria-labelledby="price-title" className="haulr-section scroll-mt-(--haulr-header)">
            <div className="haulr-shell grid gap-12 lg:grid-cols-12 lg:gap-16">
                <header className="flex flex-col gap-5 lg:col-span-5">
                    <p className="haulr-label text-accent-dark">{CLOSE_COPY.label}</p>
                    <h2 id="price-title" className="haulr-display text-text">
                        {CLOSE_COPY.title}
                    </h2>
                    <p className="text-text-secondary max-w-sm text-(length:--haulr-lead)">{CLOSE_COPY.lead}</p>
                </header>
                <div className="lg:col-span-7 lg:self-end">
                    <LaneForm />
                </div>
            </div>
        </section>
    );
}
