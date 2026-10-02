import type { TargetFigure } from "@/lib/types";

export const TARGETS_COPY = {
    label: "What we hold ourselves to",
    title: "Four numbers run the network.",
    note: "Targets for the product, not results. Haulr is a design study.",
} as const;

export const TARGETS: readonly TargetFigure[] = [
    { id: "self-serve", value: 70, unit: "%", label: "of loads booked without anyone picking up a phone" },
    { id: "visibility", value: 95, unit: "%", label: "of loads in transit with a location under an hour old" },
    { id: "pay", value: 3, unit: "days", label: "from verified delivery to carrier pay" },
    { id: "safety", value: 0, unit: "", label: "loads tendered to a carrier with lapsed authority or insurance" },
];
