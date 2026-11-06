"use client";
import { useNow } from "@/lib/hooks/use-now";
import { minutesSince } from "@/lib/loads/tracking";
import { ageOf } from "@/lib/tracking/view";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    at: number;
    template: string;
}

export default function UpdatedAge({ at, template }: Props) {
    const now = useNow();
    if (!at || now === null) return null;
    return <span className="tabular-nums">{fillTemplate(template, { age: ageOf(minutesSince(new Date(at).toISOString(), now)) })}</span>;
}
