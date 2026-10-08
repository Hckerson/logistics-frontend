import AuditLog from "@/components/home/audit-log";
import { ENTERPRISE_COPY, ENTERPRISE_ITEMS } from "@/lib/data/home/enterprise";

export default function EnterpriseSection() {
    return (
        <section aria-labelledby="enterprise-title" className="haulr-section bg-background-alt">
            <div className="haulr-shell grid gap-14 lg:grid-cols-12 lg:gap-16">
                <header className="flex flex-col gap-6 lg:sticky lg:top-[calc(var(--haulr-header)+3rem)] lg:order-last lg:col-span-5 lg:self-start">
                    <p className="haulr-label text-accent">{ENTERPRISE_COPY.label}</p>
                    <h2 id="enterprise-title" className="haulr-title text-text">
                        {ENTERPRISE_COPY.title}
                    </h2>
                    <p className="text-text-secondary text-(length:--haulr-lead)">{ENTERPRISE_COPY.lead}</p>
                    <p className="haulr-label text-text-muted">{ENTERPRISE_COPY.note}</p>
                </header>
                <div className="flex flex-col gap-10 lg:col-span-7">
                    <div className="min-h-64">
                        <AuditLog />
                    </div>
                    <ul className="border-border flex flex-col border-t">
                        {ENTERPRISE_ITEMS.map((item) => (
                            <li
                                key={item.id}
                                className="border-border grid gap-2 border-b py-6 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-10"
                            >
                                <h3 className="text-text text-xl tracking-tight">{item.title}</h3>
                                <p className="text-text-secondary">{item.body}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
