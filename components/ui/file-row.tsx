"use client";
import clsx from "clsx";
import { Close, Document, Renew } from "@carbon/icons-react";
import { Button as AriaButton } from "react-aria-components";
import Button from "@/components/ui/button";
import ProgressLine from "@/components/ui/progress-line";
import StatusLabel from "@/components/ui/status-label";
import { squareButtonClass } from "@/lib/ui/classes";
import { UI_COPY } from "@/lib/ui/constants";
import { fillTemplate } from "@/lib/utils/fill-template";
import { fileSize } from "@/lib/utils/format-number";
import type { FileUploadState, SignalTone } from "@/lib/types";

interface Props {
    name: string;
    sizeBytes: number;
    state: FileUploadState;
    progress?: number;
    message?: string;
    onRemove?: () => void;
    onRetry?: () => void;
}

const TONES: Record<FileUploadState, SignalTone> = {
    uploading: "live",
    scanning: "live",
    uploaded: "success",
    rejected: "danger",
    failed: "danger",
};

export default function FileRow({ name, sizeBytes, state, progress = 0, message, onRemove, onRetry }: Props) {
    const percent = Math.round(Math.min(1, Math.max(0, progress)) * 100);
    const failed = state === "rejected" || state === "failed";

    return (
        <li className="border-border flex flex-col gap-1.5 border-b py-2 last:border-b-0">
            <div className="flex items-start gap-3">
                <Document aria-hidden className="text-text-muted mt-0.5 size-4 shrink-0" />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="text-text text-xs break-all">{name}</p>
                    <p className="text-text-muted text-xs tabular-nums">{fileSize(sizeBytes)}</p>
                </div>
                <StatusLabel label={UI_COPY.fileStates[state]} tone={TONES[state]} pulse={state === "scanning"} className="mt-0.5" />
                {onRetry ? (
                    <Button tone="ghost" size="sm" icon={Renew} onPress={onRetry}>
                        {UI_COPY.retry}
                    </Button>
                ) : null}
                {onRemove ? (
                    <AriaButton
                        aria-label={fillTemplate(UI_COPY.remove, { name })}
                        onPress={onRemove}
                        className={squareButtonClass("ghost", "sm")}
                    >
                        <Close aria-hidden className="size-3.5" />
                    </AriaButton>
                ) : null}
            </div>
            {state === "uploading" ? (
                <div
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percent}
                    aria-valuetext={fillTemplate(UI_COPY.fileProgress, { percent: String(percent), name })}
                    className="pl-7"
                >
                    <ProgressLine value={percent / 100} className="bg-border" />
                </div>
            ) : null}
            {message ? <p className={clsx("pl-7 text-xs", failed ? "text-error" : "text-text-muted")}>{message}</p> : null}
        </li>
    );
}
