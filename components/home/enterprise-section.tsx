import AuditLog from "@/components/home/audit-log";
import { ENTERPRISE_COPY, ENTERPRISE_ITEMS } from "@/lib/data/home/enterprise";

export default function EnterpriseSection() {
    return (
        <section aria-labelledby="enterprise-title" className="haulr-section bg-background-alt">
            <div className="haulr-shell flex flex-col gap-14">
                <header className="flex max-w-4xl flex-col gap-5">
                    <p className="haulr-label text-accent">{ENTERPRISE_COPY.label}</p>
                    <h2 id="enterprise-title" className="haulr-title text-text">
                        {ENTERPRISE_COPY.title}
                    </h2>
                    <p className="text-text-secondary max-w-xl text-(length:--haulr-lead)">{ENTERPRISE_COPY.lead}</p>
                </header>
                <div className="grid gap-6 lg:grid-cols-12">
                    <div className="min-h-72 lg:col-span-5">
                        <AuditLog />
                    </div>
                    <ul className="border-border grid border-t border-l sm:grid-cols-2 lg:col-span-7">
                        {ENTERPRISE_ITEMS.map((item) => (
                            <li key={item.id} className="border-border flex flex-col gap-3 border-r border-b p-6 sm:p-8">
                                <h3 className="text-text text-xl tracking-tight">{item.title}</h3>
                                <p className="text-text-secondary">{item.body}</p>
                            </li>
                        ))}
                    </ul>
                </div>
                <p className="haulr-label text-text-muted">{ENTERPRISE_COPY.note}</p>
            </div>
        </section>
    );
}
