"use client";
import { useEffect } from "react";
import Toggletip from "@/components/ui/toggletip";
import type { LoadDto } from "@/lib/contract/schemas";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { useLoadCancellation } from "@/lib/hooks/use-loads";
import { stopMoment } from "@/lib/loads/view";
import { errorMessage, failureFrom } from "@/lib/utils/action-result";
import { formatMoney } from "@/lib/utils/currency";
import { fillTemplate } from "@/lib/utils/fill-template";
import { ERROR_COPY } from "@/lib/errors/constants";

interface Props {
    load: LoadDto;
    onSettled: () => void;
}

const { tonu: copy } = LOAD_COPY.actions;

export default function CancellationTerms({ load, onSettled }: Props) {
    const terms = useLoadCancellation(load.id, true);
    const settled = !terms.isPending;

    useEffect(() => {
        if (settled) onSettled();
    }, [settled, onSettled]);

    if (terms.isPending) return <p className="text-text-muted text-xs">{copy.checking}</p>;

    if (terms.isError) {
        const failure = failureFrom(terms.error);
        return <p className="text-error text-xs">{failure ? errorMessage(failure) : ERROR_COPY.offline}</p>;
    }

    const { tonu, freeUntil } = terms.data;
    if (tonu) {
        return (
            <p className="text-signal-warning flex items-start gap-1 text-xs">
                <span className="pt-1">{fillTemplate(copy.owed, { carrier: load.carrier?.name ?? "", amount: formatMoney(tonu.totalCents, tonu.currency) })}</span>
                <Toggletip term={copy.term} definition={copy.definition} />
            </p>
        );
    }

    return freeUntil ? <p className="text-text-secondary text-xs">{fillTemplate(copy.free, { time: stopMoment(freeUntil, load.stops[0].facility.timeZone) })}</p> : null;
}
