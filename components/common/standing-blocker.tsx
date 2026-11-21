import clsx from "clsx";
import Link from "next/link";
import { Close, ErrorFilled, WarningAltFilled } from "@carbon/icons-react";
import IconButton from "@/components/ui/icon-button";
import type { StandingBlockerDto } from "@/lib/contract/schemas";
import { STANDING_COPY } from "@/lib/data/billing/standing-copy";
import { BUILT_FIXES } from "@/lib/billing/constants";
import { consequenceOf } from "@/lib/billing/standing";
import { RECORD_LINK } from "@/lib/ui/constants";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    blocker: StandingBlockerDto;
    organisation: string;
    onDismiss?: () => void;
}

const copy = STANDING_COPY;

const TONE = {
    blocking: { frame: "border-signal-danger-edge bg-signal-danger-wash", text: "text-signal-danger", icon: ErrorFilled },
    warning: { frame: "border-signal-warning-edge bg-signal-warning-wash", text: "text-signal-warning", icon: WarningAltFilled },
} as const;

export default function StandingBlocker({ blocker, organisation, onDismiss }: Props) {
    const tone = TONE[blocker.severity];
    const { title, fix } = copy.types[blocker.type];
    const route = blocker.fix ? BUILT_FIXES[blocker.fix] : undefined;
    const Icon = tone.icon;

    return (
        <div className={clsx("flex items-start gap-3 border px-3 py-2.5 text-xs", tone.frame)}>
            <Icon aria-hidden className={clsx("mt-px size-4 shrink-0", tone.text)} />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="text-text">
                    <span className={clsx("haulr-label mr-2", tone.text)}>{copy.severity[blocker.severity]}</span>
                    {title}
                </p>
                <p className="text-text-secondary">{consequenceOf(blocker, organisation)}</p>
                {route ? (
                    <Link href={route} className={clsx(RECORD_LINK, "self-start font-sans")}>
                        {fix}
                    </Link>
                ) : blocker.fix ? (
                    <p className="text-text-secondary">{fillTemplate(copy.fixText, { fix, where: copy.where[blocker.fix] })}</p>
                ) : null}
            </div>
            {onDismiss ? <IconButton label={copy.dismiss} icon={Close} tone="ghost" size="sm" onPress={onDismiss} /> : null}
        </div>
    );
}
