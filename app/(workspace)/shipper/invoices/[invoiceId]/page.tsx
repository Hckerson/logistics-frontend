import type { Metadata } from "next";
import InvoiceDetail from "@/components/common/invoice-detail";
import WorkspacePage from "@/components/common/workspace-page";
import { CAPABILITY_ROLES } from "@/lib/auth/capabilities";
import { requireRoles } from "@/lib/auth/guards";
import { readInvoice } from "@/lib/billing/server-read";
import { INVOICE_COPY } from "@/lib/data/billing/invoice-copy";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    params: Promise<{ invoiceId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { invoiceId } = await params;
    return { title: fillTemplate(INVOICE_COPY.meta.title, { number: invoiceId }), robots: { index: false, follow: false } };
}

export default async function InvoicePage({ params }: Props) {
    await requireRoles(CAPABILITY_ROLES.payInvoices);
    const { invoiceId } = await params;
    const invoice = await readInvoice(invoiceId);

    return (
        <WorkspacePage>
            <InvoiceDetail initial={invoice} />
        </WorkspacePage>
    );
}
