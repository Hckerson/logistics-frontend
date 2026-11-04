"use client";
import { useEffect, useState } from "react";
import { Checkmark, Copy } from "@carbon/icons-react";
import IconButton from "@/components/ui/icon-button";
import { COPY_RESET_MS } from "@/lib/ui/constants";

interface Props {
    value: string;
    label: string;
    done: string;
}

export default function CopyButton({ value, label, done }: Props) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return;
        const reset = setTimeout(() => setCopied(false), COPY_RESET_MS);
        return () => clearTimeout(reset);
    }, [copied]);

    const copy = () => navigator.clipboard.writeText(value).then(() => setCopied(true), () => setCopied(false));

    return (
        <>
            <IconButton label={label} icon={copied ? Checkmark : Copy} size="sm" onPress={copy} className={copied ? "text-accent" : undefined} />
            <span role="status" className="sr-only">
                {copied ? done : ""}
            </span>
        </>
    );
}
