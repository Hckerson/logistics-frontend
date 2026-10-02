"use client";
import clsx from "clsx";
import DriverPhone from "@/components/home/driver-phone";
import ShipperConsole from "@/components/home/shipper-console";
import { useSide } from "@/lib/hooks/use-side";
import { PRODUCTS_COPY } from "@/lib/data/home/products";

const FOCUS = "transition-[opacity,scale] duration-700 ease-(--haulr-ease)";
const DIMMED = "scale-[0.97] opacity-55";

export default function ProductsSection() {
    const { side } = useSide();

    return (
        <section aria-labelledby="products-title" className="haulr-section bg-background-alt">
            <div className="haulr-shell flex flex-col gap-14">
                <header className="grid gap-6 lg:grid-cols-12 lg:items-end">
                    <div className="flex flex-col gap-5 lg:col-span-8">
                        <p className="haulr-label text-accent">{PRODUCTS_COPY.label}</p>
                        <h2 id="products-title" className="haulr-title text-text">
                            {PRODUCTS_COPY.title}
                        </h2>
                    </div>
                    <p className="text-text-secondary text-(length:--haulr-lead) lg:col-span-4">
                        {PRODUCTS_COPY.lead}
                    </p>
                </header>
                <div className="grid items-center gap-10 lg:grid-cols-12">
                    <div className={clsx("lg:col-span-8", FOCUS, side === "haul" && DIMMED)}>
                        <ShipperConsole />
                    </div>
                    <div className={clsx("lg:col-span-4", FOCUS, side === "ship" && DIMMED)}>
                        <DriverPhone />
                    </div>
                </div>
            </div>
        </section>
    );
}
