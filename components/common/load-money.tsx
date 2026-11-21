"use client";
import { ArrowRight } from "@carbon/icons-react";
import ButtonLink from "@/components/ui/button-link";
import { appRoutes } from "@/lib/app-routes";
import { INVOICE_COPY } from "@/lib/data/billing/invoice-copy";
import { fillTemplate } from "@/lib/utils/fill-template";
import MoneyBreakdown from "@/components/common/money-breakdown";
import type { LoadDto } from "@/lib/contract/schemas";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { useLoad } from "@/lib/hooks/use-loads";

interface Props {
    initial: LoadDto;
}

const { money: copy } = LOAD_COPY;

export default function LoadMoney({ initial }: Props) {
    const { data: load = initial } = useLoad(initial.id, initial);

    return (
        <>
            {load.shipperPrice ? <MoneyBreakdown label={copy.shipperPrice} money={load.shipperPrice} /> : null}
            {load.carrierPay ? <MoneyBreakdown label={copy.carrierPay} money={load.carrierPay} /> : null}
            {load.invoiceId ? (
                <ButtonLink href={appRoutes.invoice(load.invoiceId)} tone="link" size="sm" trailing={ArrowRight} className="self-start">
                    {fillTemplate(INVOICE_COPY.viewInvoice, { number: load.invoiceId })}
                </ButtonLink>
            ) : null}
        </>
    );
}
