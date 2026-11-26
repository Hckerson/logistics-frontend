"use client";
import Image from "next/image";
import { useState, type KeyboardEvent } from "react";
import { FitToScreen, ZoomIn, ZoomOut } from "@carbon/icons-react";
import IconButton from "@/components/ui/icon-button";
import { DOCUMENT_PREVIEW_COPY as copy } from "@/lib/data/documents/preview";
import { PREVIEW_ZOOM } from "@/lib/documents/constants";

interface Props {
    url: string;
    alt: string;
    onError: () => void;
}

const BASE = { width: 1200, height: 1600 } as const;
const clamp = (zoom: number) => Math.min(Math.max(zoom, PREVIEW_ZOOM.min), PREVIEW_ZOOM.max);

export default function DocumentImageView({ url, alt, onError }: Props) {
    const [zoom, setZoom] = useState<number>(PREVIEW_ZOOM.min);
    const step = (direction: number) => setZoom((current) => clamp(current + direction * PREVIEW_ZOOM.step));

    const keys = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "+" || event.key === "=") step(1);
        else if (event.key === "-") step(-1);
        else return;
        event.preventDefault();
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-end gap-1">
                <IconButton label={copy.zoomOut} icon={ZoomOut} size="sm" isDisabled={zoom <= PREVIEW_ZOOM.min} onPress={() => step(-1)} />
                <IconButton label={copy.zoomReset} icon={FitToScreen} size="sm" isDisabled={zoom === PREVIEW_ZOOM.min} onPress={() => setZoom(PREVIEW_ZOOM.min)} />
                <IconButton label={copy.zoomIn} icon={ZoomIn} size="sm" isDisabled={zoom >= PREVIEW_ZOOM.max} onPress={() => step(1)} />
            </div>
            <div
                tabIndex={0}
                onKeyDown={keys}
                aria-label={alt}
                className="border-border bg-background-muted/40 focus-visible:outline-text h-[65svh] overflow-auto border outline-none focus-visible:outline-2"
            >
                <Image
                    src={url}
                    alt={alt}
                    width={BASE.width}
                    height={BASE.height}
                    unoptimized
                    onError={onError}
                    className="mx-auto h-auto max-w-none"
                    style={{ width: `${zoom * 100}%` }}
                />
            </div>
        </div>
    );
}
