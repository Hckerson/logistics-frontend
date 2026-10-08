import RecordScene from "@/components/home/record-scene";
import { PRODUCTS_COPY } from "@/lib/data/home/products";

export default function ProductsSection() {
    return (
        <section aria-labelledby="products-title" className="bg-background-alt pt-(--haulr-section)">
            <header className="haulr-shell grid gap-6 lg:grid-cols-12 lg:items-end">
                <div className="flex flex-col gap-5 lg:col-span-8">
                    <p className="haulr-label text-accent">{PRODUCTS_COPY.label}</p>
                    <h2 id="products-title" className="haulr-title text-text">
                        {PRODUCTS_COPY.title}
                    </h2>
                </div>
                <p className="text-text-secondary text-(length:--haulr-lead) lg:col-span-4">{PRODUCTS_COPY.lead}</p>
            </header>
            <RecordScene />
        </section>
    );
}
