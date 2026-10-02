import PayBar from "@/components/home/pay-bar";
import { PAY_COPY, PAY_TERMS } from "@/lib/data/home/pay";

export default function PaySection() {
    return (
        <section aria-labelledby="pay-title" className="haulr-section">
            <div className="haulr-shell grid gap-14 lg:grid-cols-12 lg:items-end lg:gap-16">
                <header className="flex flex-col gap-6 lg:col-span-6">
                    <p className="haulr-label text-accent">{PAY_COPY.label}</p>
                    <h2 id="pay-title" className="haulr-display text-text">
                        {PAY_COPY.title}
                    </h2>
                    <p className="text-text-secondary max-w-md text-(length:--haulr-lead)">{PAY_COPY.lead}</p>
                </header>
                <div className="flex flex-col gap-8 lg:col-span-6">
                    <p className="haulr-label text-text-muted">{PAY_COPY.axis}</p>
                    <dl className="flex flex-col gap-8">
                        {PAY_TERMS.map((term, index) => (
                            <PayBar key={term.id} term={term} order={index} />
                        ))}
                    </dl>
                    <p className="haulr-label text-text-muted">{PAY_COPY.note}</p>
                </div>
            </div>
        </section>
    );
}
