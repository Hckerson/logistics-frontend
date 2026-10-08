"use client";
import { useState } from "react";
import LaneForm from "@/components/home/lane-form";
import LaneTicket from "@/components/home/lane-ticket";
import { hubNamed, laneBetween } from "@/lib/home/quote-map";
import type { LaneDraft } from "@/lib/types";

export default function LaneQuote() {
    const [draft, setDraft] = useState<LaneDraft>({ origin: "", destination: "" });

    return (
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
            <div className="lg:col-span-4">
                <LaneForm lane={draft} onChange={setDraft} />
            </div>
            <div className="lg:col-span-8">
                <LaneTicket
                    from={hubNamed(draft.origin)}
                    to={hubNamed(draft.destination)}
                    lane={laneBetween(draft.origin, draft.destination)}
                />
            </div>
        </div>
    );
}
