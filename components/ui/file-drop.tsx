"use client";
import clsx from "clsx";
import { useId } from "react";
import { Upload } from "@carbon/icons-react";
import { Button as AriaButton, DropZone, FileTrigger, isFileDropItem } from "react-aria-components";
import HudCorners from "@/components/ui/hud-corners";
import { describedBy } from "@/lib/ui/classes";
import { FOCUS_CORNERS, FOCUS_RING, LABEL_TEXT } from "@/lib/ui/constants";
import { UI_COPY } from "@/lib/ui/copy";
import { checkFiles } from "@/lib/utils/check-files";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    label: string;
    accept: readonly string[];
    maxSizeMb: number;
    maxFiles: number;
    multiple?: boolean;
    disabledReason?: string;
    onFiles: (files: File[]) => void;
    onReject: (messages: string[]) => void;
}

const CHOOSE = clsx(
    "text-text decoration-border-dark hover:text-accent cursor-pointer underline underline-offset-4 transition-colors disabled:cursor-not-allowed",
    FOCUS_RING,
);

export default function FileDrop(props: Props) {
    const { label, accept, maxSizeMb, maxFiles, multiple = true, disabledReason, onFiles, onReject } = props;
    const limitsId = useId();
    const reasonId = useId();
    const disabled = disabledReason !== undefined;

    const receive = (files: readonly File[]) => {
        if (files.length === 0) return;
        const { accepted, rejected } = checkFiles(files, { accept, maxSizeMb, maxFiles: multiple ? maxFiles : 1 });
        if (rejected.length > 0) onReject(rejected);
        if (accepted.length > 0) onFiles(accepted);
    };

    return (
        <DropZone
            aria-label={label}
            aria-describedby={describedBy(limitsId, disabled && reasonId)}
            isDisabled={disabled}
            onDrop={(event) => {
                void Promise.all(event.items.filter(isFileDropItem).map((item) => item.getFile())).then(receive);
            }}
            className={({ isDropTarget }) =>
                clsx(
                    "group/drop relative flex flex-col items-center gap-2 border px-4 py-6 text-center transition-colors outline-none",
                    isDropTarget ? "border-signal-live-edge bg-signal-live-wash" : "border-border bg-background-muted/40",
                    disabled && "opacity-40",
                )
            }
        >
            {({ isDropTarget, isFocusVisible }) => (
                <>
                    <HudCorners
                        tone="accent"
                        className={clsx(
                            "transition-[opacity,scale] duration-300 ease-out group-focus-within/drop:scale-100 group-focus-within/drop:opacity-100",
                            isDropTarget || isFocusVisible ? FOCUS_CORNERS.shown : FOCUS_CORNERS.hidden,
                        )}
                    />
                    <Upload aria-hidden className={clsx("size-5 transition-colors", isDropTarget ? "text-accent" : "text-text-muted")} />
                    <p className="text-text-secondary text-xs">
                        {UI_COPY.dropFiles}{" "}
                        <FileTrigger
                            acceptedFileTypes={accept}
                            allowsMultiple={multiple}
                            onSelect={(files) => receive(Array.from(files ?? []))}
                        >
                            <AriaButton isDisabled={disabled} className={CHOOSE}>
                                {UI_COPY.chooseFiles}
                            </AriaButton>
                        </FileTrigger>
                    </p>
                    <p id={limitsId} className={LABEL_TEXT}>
                        {fillTemplate(multiple ? UI_COPY.fileLimits : UI_COPY.fileLimitOne, { size: String(maxSizeMb), count: String(maxFiles) })}
                    </p>
                    {disabled ? (
                        <p id={reasonId} className="text-text-muted text-xs">
                            {disabledReason}
                        </p>
                    ) : null}
                </>
            )}
        </DropZone>
    );
}
