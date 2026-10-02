import { Camera, CheckmarkFilled, RadioButton } from "@carbon/icons-react";
import { DRIVER_VIEW, PRODUCTS_COPY } from "@/lib/data/home/products";

export default function DriverPhone() {
    return (
        <div
            role="img"
            aria-label={PRODUCTS_COPY.phone.summary}
            className="border-border-dark bg-background-muted mx-auto w-full max-w-xs rounded-[2rem] border p-3 shadow-2xl"
        >
            <div aria-hidden className="border-border bg-background flex flex-col gap-5 rounded-[1.4rem] border p-5">
                <div className="flex items-center justify-between">
                    <p className="haulr-label text-text-muted">{PRODUCTS_COPY.phone.label}</p>
                    <span className="bg-accent block size-1.5 animate-pulse rounded-full" />
                </div>
                <div className="flex flex-col gap-1">
                    <p className="text-accent text-sm">{DRIVER_VIEW.stop}</p>
                    <p className="text-text text-3xl tracking-tight">{DRIVER_VIEW.place}</p>
                    <p className="text-text-muted text-sm">{DRIVER_VIEW.window}</p>
                </div>
                <ul className="flex flex-col gap-3">
                    {DRIVER_VIEW.steps.map((step) => (
                        <li key={step.id} className="flex items-start gap-3 text-sm">
                            {step.done ? (
                                <CheckmarkFilled className="text-success mt-0.5 size-4 shrink-0" />
                            ) : (
                                <RadioButton className="text-accent mt-0.5 size-4 shrink-0" />
                            )}
                            <span className={step.done ? "text-text-muted" : "text-text"}>{step.label}</span>
                        </li>
                    ))}
                </ul>
                <div className="border-accent/50 text-accent flex h-24 flex-col items-center justify-center gap-2 rounded-md border border-dashed">
                    <Camera className="size-5" />
                    <p className="text-sm">{DRIVER_VIEW.pod}</p>
                </div>
                <p className="bg-accent text-text-inverse flex h-12 items-center justify-center rounded-md font-medium">
                    {DRIVER_VIEW.action}
                </p>
                <p className="text-text-secondary text-center font-mono text-xs">{DRIVER_VIEW.pay}</p>
            </div>
        </div>
    );
}
