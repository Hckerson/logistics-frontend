"use client";
import { Printer } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import { LEGAL_COPY } from "@/lib/data/legal/copy";

export default function PrintButton() {
    return (
        <Button tone="outline" icon={Printer} onPress={() => window.print()} className="print:hidden">
            {LEGAL_COPY.record.print}
        </Button>
    );
}
