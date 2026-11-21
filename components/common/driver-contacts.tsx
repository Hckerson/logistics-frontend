import { Phone } from "@carbon/icons-react";
import Link from "next/link";
import type { DriverContactDto } from "@/lib/contract/schemas";
import { DRIVER_COPY } from "@/lib/data/driver/copy";
import { OPERATIONS_CONTACT } from "@/lib/driver/constants";
import { telOf } from "@/lib/driver/directions";
import { FOCUS_RING } from "@/lib/ui/constants";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    dispatch: DriverContactDto | null;
    lead?: string;
}

const { contact: copy } = DRIVER_COPY;
const ROW = `hover:text-text flex min-h-12 items-center justify-between gap-3 text-sm transition-colors ${FOCUS_RING}`;

export default function DriverContacts({ dispatch, lead }: Props) {
    const people = [
        ...(dispatch ? [{ label: fillTemplate(copy.dispatch, { name: dispatch.name }), phone: dispatch.phone }] : []),
        { label: fillTemplate(copy.operations, { name: OPERATIONS_CONTACT.name }), phone: OPERATIONS_CONTACT.phone },
    ];

    return (
        <section aria-label={copy.label} className="border-border flex flex-col gap-2 border-t pt-4">
            <p className="haulr-label text-text-muted">{copy.label}</p>
            {lead ? <p className="text-text-secondary text-xs">{lead}</p> : null}
            <ul className="flex flex-col">
                {people.map(({ label, phone }) => (
                    <li key={phone} className="border-border border-b last:border-b-0">
                        <Link href={telOf(phone)} className={`${ROW} text-text-secondary`}>
                            <span>{label}</span>
                            <span className="flex items-center gap-2 font-mono text-xs">
                                {phone}
                                <Phone aria-hidden className="text-text size-4" />
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
