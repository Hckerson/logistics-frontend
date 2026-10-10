"use client";
import clsx from "clsx";
import ConsoleLink from "@/components/auth/console-link";
import OutcomeStep from "@/components/auth/outcome-step";
import { QUIET_LINK } from "@/lib/auth/constants";
import { HELP_ROUTE } from "@/lib/constants";
import { AUTH_COPY } from "@/lib/data/auth/shared";
import { SUPPORT_COPY } from "@/lib/data/support/copy";
import type { TicketReceipt as Receipt } from "@/lib/types";

interface Props {
    receipt: Receipt & { email: string };
    onAgain: () => void;
}

const { receipt: copy, response } = SUPPORT_COPY;

export default function TicketReceipt({ receipt, onAgain }: Props) {
    const body = copy.body.replace("{time}", response[receipt.urgency]).replace("{email}", receipt.email);

    return (
        <OutcomeStep label={copy.label} detail={receipt.reference} body={body}>
            <ConsoleLink href={HELP_ROUTE} label={AUTH_COPY.links.help.label} />
            <button type="button" onClick={onAgain} className={clsx(QUIET_LINK, "cursor-pointer self-start")}>
                {copy.another}
            </button>
        </OutcomeStep>
    );
}
