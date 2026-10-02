"use client";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import LaneForm from "@/components/home/lane-form";
import { CLOSE_COPY } from "@/lib/data/home/close";
import { laneBetween, milesBetween } from "@/lib/home/quote-map";
import type { LaneDraft } from "@/lib/types";

const QuoteMap = dynamic(() => import("@/components/home/quote-map"), { ssr: false });

const EDGE_FADE = "[mask-image:radial-gradient(ellipse_at_center,black_52%,transparent_78%)]";

export default function LaneQuote() {
    const [draft, setDraft] = useState<LaneDraft>({ origin: "", destination: "" });
    const lane = useMemo(() => laneBetween(draft.origin, draft.destination), [draft.origin, draft.destination]);

    return (
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-10">
            <div className="lg:col-span-4">
                <LaneForm lane={draft} onChange={setDraft} />
            </div>
            <div className="flex flex-col gap-2 lg:col-span-8">
                <div className={`relative aspect-[4/3] w-full lg:aspect-[16/10] ${EDGE_FADE}`}>
                    <QuoteMap lane={lane} />
                </div>
                <p aria-live="polite" className="haulr-label text-text-muted min-h-4 text-center">
                    {lane
                        ? `${lane.from.code} → ${lane.to.code} · ${milesBetween(lane)} ${CLOSE_COPY.map.unit}`
                        : CLOSE_COPY.map.idle}
                </p>
            </div>
        </div>
    );
}
