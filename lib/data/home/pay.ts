import type { PayTerm } from "@/lib/types";

export const PAY_COPY = {
    label: "For carriers",
    title: "Paid in three days. Not thirty.",
    lead: "Pay starts counting at verified proof of delivery, and quick pay lands the same day. The rate you booked is the rate you get.",
    axis: "Days from delivery to pay",
    note: "Comparison with typical broker terms. Sample figures.",
} as const;

export const PAY_SCALE_DAYS = 30;

export const PAY_TERMS: readonly PayTerm[] = [
    { id: "quick", label: "Haulr quick pay", days: 0, value: "Same day", featured: true },
    { id: "standard", label: "Haulr standard", days: 3, value: "3 days", featured: true },
    { id: "typical", label: "Typical broker terms", days: 30, value: "30 days", featured: false },
];
