import clsx from "clsx";
import { PRIMITIVES_COPY } from "@/lib/data/primitives/copy";
import { SPECIMEN_SWATCHES } from "@/lib/data/primitives/samples";
import { SIGNAL_TONES } from "@/lib/ui/constants";

const { steps, toneNames } = PRIMITIVES_COPY.demo;
const STEPS = ["word", "edge", "wash"] as const;

export default function PrimitivesSignals() {
    return (
        <div className="grid w-full grid-cols-[auto_repeat(7,minmax(0,1fr))] items-center gap-x-2 gap-y-1.5">
            <span aria-hidden />
            {SPECIMEN_SWATCHES.map((swatch) => (
                <span key={swatch.tone} className={clsx("haulr-label truncate", SIGNAL_TONES[swatch.tone])}>
                    {toneNames[swatch.tone]}
                </span>
            ))}
            {STEPS.map((step) => (
                <div key={step} className="contents">
                    <span className="haulr-label text-text-muted pr-2">{steps[step]}</span>
                    {SPECIMEN_SWATCHES.map((swatch) => (
                        <span key={swatch.tone} className={clsx("border-border block h-7 border", swatch[step])} />
                    ))}
                </div>
            ))}
        </div>
    );
}
