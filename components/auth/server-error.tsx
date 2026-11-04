"use client";
import { useState, useTransition } from "react";
import { Renew } from "@carbon/icons-react";
import AuthIntro from "@/components/auth/auth-intro";
import AuthLinks from "@/components/auth/auth-links";
import ConsoleLink from "@/components/auth/console-link";
import SystemPanel from "@/components/auth/system-panel";
import Button from "@/components/ui/button";
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
                    <Button size="wide" trailing={Renew} pending={pending} pendingLabel={SYSTEM_COPY.retrying} onPress={again}>
                        {SYSTEM_COPY.retry}
                    </Button>
                )}
            </SystemPanel>
        </>
    );
}
