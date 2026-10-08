import LaneBoard from "@/components/home/lane-board";
import { LANES_COPY } from "@/lib/data/home/lanes";

export default function LanesBand() {
    return (
        <section aria-labelledby="lanes-title" className="haulr-section bg-background-alt">
            <div className="haulr-shell flex flex-col gap-12">
                <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="flex flex-col gap-4">
                        <p className="haulr-label text-accent">{LANES_COPY.label}</p>
                        <h2 id="lanes-title" className="haulr-title text-text max-w-2xl">
                            {LANES_COPY.title}
                        </h2>
                    </div>
                    <p className="haulr-label text-text-muted max-w-xs lg:text-right">{LANES_COPY.note}</p>
                </header>
                <LaneBoard />
            </div>
        </section>
    );
}
