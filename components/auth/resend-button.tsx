"use client";
import { Send } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import ProgressLine from "@/components/ui/progress-line";
import { VERIFICATION_RESEND_COOLDOWN_S } from "@/lib/constants";
import { VERIFY_COPY } from "@/lib/data/auth/verify";
import { useCountdown } from "@/lib/hooks/use-countdown";
import { formatClock } from "@/lib/utils/date-formatter";

interface Props {
    label: string;
    sentAt: number | null;
    pending: boolean;
    onResend: () => void;
}

const SECOND = 1000;
const COOLDOWN = VERIFICATION_RESEND_COOLDOWN_S * SECOND;
const { resend } = VERIFY_COPY;

export default function ResendButton({ label, sentAt, pending, onResend }: Props) {
    const remaining = useCountdown(sentAt === null ? 0 : sentAt + COOLDOWN);
    const waiting = remaining > 0 && !pending;
    const wait = resend.wait.replace("{time}", formatClock(Math.ceil(remaining / SECOND)));

    return (
        <Button
            size="wide"
            trailing={waiting || pending ? undefined : Send}
            pending={pending}
            pendingLabel={resend.pending}
            disabledReason={waiting ? wait : undefined}
            onPress={onResend}
        >
            <span className="tabular-nums">{waiting ? wait : label}</span>
            {waiting ? <ProgressLine value={1 - remaining / COOLDOWN} className="bg-border absolute inset-x-0 bottom-0" /> : null}
        </Button>
    );
}
