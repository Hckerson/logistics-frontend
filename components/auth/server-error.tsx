"use client";
import clsx from "clsx";
import { useState, useTransition } from "react";
import { Renew } from "@carbon/icons-react";
import AuthIntro from "@/components/auth/auth-intro";
import AuthLinks from "@/components/auth/auth-links";
import ConsoleLink from "@/components/auth/console-link";
import ProgressLine from "@/components/auth/progress-line";
import SystemPanel from "@/components/auth/system-panel";
import { CONSOLE_ACTION } from "@/lib/auth/constants";
import { ERROR_RETRY_LIMIT, SUPPORT_ROUTE, supportRoute } from "@/lib/constants";
import { SYSTEM_COPY } from "@/lib/data/system";

interface Props {
    digest?: string;
    retry: () => void;
}

const UNREFERENCED = "unreferenced";
const retries = new Map<string, number>();
const { serverError: view, footer } = SYSTEM_COPY;

export default function ServerError({ digest, retry }: Props) {
    const key = digest ?? UNREFERENCED;
    const [tries] = useState(() => retries.get(key) ?? 0);
    const [pending, startTransition] = useTransition();
    const exhausted = tries >= ERROR_RETRY_LIMIT;

    const again = () => {
        if (pending) return;
        retries.set(key, tries + 1);
        startTransition(retry);
    };

    return (
        <>
            <AuthIntro title={view.title} lead={view.lead} />
            <SystemPanel
                view={view}
                outcome={exhausted ? SYSTEM_COPY.exhausted : view.outcome}
                detail={digest ? `${SYSTEM_COPY.reference} ${digest}` : undefined}
                signal={pending ? "pending" : "held"}
                footer={<AuthLinks label={footer.label} links={footer.links} />}
            >
                {exhausted ? (
                    <ConsoleLink href={digest ? supportRoute({ reference: digest }) : SUPPORT_ROUTE} label={SYSTEM_COPY.support} />
                ) : (
                    <button type="button" onClick={again} aria-disabled={pending} className={clsx(CONSOLE_ACTION, "aria-disabled:cursor-wait")}>
                        {pending ? SYSTEM_COPY.retrying : SYSTEM_COPY.retry}
                        <Renew aria-hidden className="size-4" />
                        {pending ? <ProgressLine className="bg-text-inverse/15 absolute inset-x-0 bottom-0" /> : null}
                    </button>
                )}
            </SystemPanel>
        </>
    );
}
