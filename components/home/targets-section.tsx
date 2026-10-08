import clsx from "clsx";
import TargetCount from "@/components/home/target-count";
import { TARGETS, TARGETS_COPY } from "@/lib/data/home/targets";

export default function TargetsSection() {
    return (
        <section aria-labelledby="targets-title" className="haulr-section">
            <div className="haulr-shell flex flex-col gap-16">
                <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="flex flex-col gap-5">
                        <p className="haulr-label text-accent">{TARGETS_COPY.label}</p>
                        <h2 id="targets-title" className="haulr-title text-text max-w-2xl">
                            {TARGETS_COPY.title}
                        </h2>
                    </div>
                    <p className="haulr-label text-text-muted max-w-xs lg:text-right">{TARGETS_COPY.note}</p>
                </header>
                <dl className="border-border grid border-t sm:grid-cols-2 lg:grid-cols-4">
                    {TARGETS.map((target, index) => (
                        <div
                            key={target.id}
                            className={clsx(
                                "border-border flex flex-col-reverse justify-end gap-6 border-b py-10 lg:border-b-0 lg:px-8 lg:first:pl-0",
                                index > 0 && "lg:border-l",
                            )}
                        >
                            <dt className="text-text-secondary max-w-56">{target.label}</dt>
                            <dd className={index === 0 ? "text-accent" : "text-text"}>
                                <TargetCount value={target.value} unit={target.unit} />
                            </dd>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}
