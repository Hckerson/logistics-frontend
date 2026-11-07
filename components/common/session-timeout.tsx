"use client";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import Countdown from "@/components/ui/countdown";
import Dialog from "@/components/ui/dialog";
import { LOGIN_ROUTE, TIME_MS } from "@/lib/constants";
import { SHELL_COPY } from "@/lib/data/shell";
import { useLogout } from "@/lib/hooks/use-logout";
import { useSessionTimeout } from "@/lib/hooks/use-session-timeout";
import type { SessionWindow } from "@/lib/types";
import { UI_COPY } from "@/lib/ui/copy";
import { fillTemplate } from "@/lib/utils/fill-template";
import { pluralize } from "@/lib/utils/plural";

interface Props {
    session: SessionWindow;
}

const { session: copy } = SHELL_COPY;

export default function SessionTimeout({ session }: Props) {
    const router = useRouter();
    const logout = useLogout();
    const { phase, expiresAt, extend, now } = useSessionTimeout(session);
    const minutes = now === null || expiresAt === null ? 0 : Math.max(1, Math.round((expiresAt - now) / TIME_MS.minute));

    const stay = () => {
        if (!extend.isPending) extend.mutate();
    };

    const signOut = () =>
        logout.mutate(undefined, {
            onSettled: () => {
                router.push(LOGIN_ROUTE);
                router.refresh();
            },
        });

    return (
        <Dialog
            role="alertdialog"
            isOpen={phase === "warning"}
            onOpenChange={(open) => {
                if (!open) stay();
            }}
            kicker={copy.kicker}
            title={copy.title}
            description={fillTemplate(copy.body, { time: pluralize(minutes, UI_COPY.durations.minute) })}
            width="sm"
            footer={
                <>
                    <Button tone="ghost" pending={logout.isPending} onPress={signOut}>
                        {copy.signOut}
                    </Button>
                    <Button pending={extend.isPending} pendingLabel={copy.extending} onPress={stay}>
                        {copy.stay}
                    </Button>
                </>
            }
        >
            <p className="flex items-baseline gap-2">
                <span className="haulr-label text-text-muted">{copy.timer}</span>
                {expiresAt === null ? null : <Countdown deadline={expiresAt} label={copy.timer} />}
            </p>
            {extend.isError ? (
                <p role="alert" className="text-error">
                    {copy.failed}
                </p>
            ) : null}
        </Dialog>
    );
}
