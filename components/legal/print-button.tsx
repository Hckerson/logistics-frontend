"use client";
import { Printer } from "@carbon/icons-react";
import { LEGAL_COPY } from "@/lib/data/legal/copy";

export default function PrintButton() {
    return (
        <button
            type="button"
            onClick={() => window.print()}
            className="haulr-label border-border-dark text-text-secondary hover:text-text hover:border-text-muted focus-visible:outline-text flex h-9 cursor-pointer items-center gap-2 border px-3 transition-colors focus-visible:outline-2 print:hidden"
        >
            <Printer aria-hidden className="size-4" />
            {LEGAL_COPY.record.print}
        </button>
    );
}
