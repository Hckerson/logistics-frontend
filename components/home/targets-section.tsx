import TargetCount from "@/components/home/target-count";
import { TARGETS, TARGETS_COPY } from "@/lib/data/home/targets";

const [FEATURED, ...SUPPORTING] = TARGETS;

export default function TargetsSection() {
    return (
        <section aria-labelledby="targets-title" className="haulr-section">
            <div className="haulr-shell grid gap-14 lg:grid-cols-12 lg:gap-16">
                <div className="flex flex-col gap-10 lg:col-span-7 lg:gap-14">
                    <header className="flex flex-col gap-5">
                        <p className="haulr-label text-accent">{TARGETS_COPY.label}</p>
                        <h2 id="targets-title" className="haulr-title text-text max-w-2xl">
                            {TARGETS_COPY.title}
                        </h2>
                    </header>
                    <dl className="flex flex-col-reverse gap-4">
                        <dt className="text-text-secondary max-w-md text-(length:--haulr-lead)">{FEATURED.label}</dt>
                        <dd className="text-accent">
                            <TargetCount value={FEATURED.value} unit={FEATURED.unit} />
                        </dd>
                    </dl>
                </div>
                <div className="flex flex-col justify-end gap-8 lg:col-span-5">
                    <dl className="border-border flex flex-col border-t">
                        {SUPPORTING.map((target) => (
                            <div
                                key={target.id}
                                className="border-border flex items-end justify-between gap-6 border-b py-6"
                            >
                                <dt className="text-text-secondary max-w-60">{target.label}</dt>
                                <dd className="text-text shrink-0">
                                    <TargetCount value={target.value} unit={target.unit} className="haulr-title" />
                                </dd>
                            </div>
                        ))}
                    </dl>
                    <p className="haulr-label text-text-muted">{TARGETS_COPY.note}</p>
                </div>
            </div>
        </section>
    );
}
