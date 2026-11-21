"use client";
import Image from "next/image";
import { Camera, Close } from "@carbon/icons-react";
import { FileTrigger } from "react-aria-components";
import IconButton from "@/components/ui/icon-button";
import { DRIVER_COPY } from "@/lib/data/driver/copy";
import { POD_IMAGE } from "@/lib/driver/constants";
import type { PodPage } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    page: PodPage;
    number: number;
    onRetake: (files: FileList | null) => void;
    onRemove: () => void;
}

const { pod: copy } = DRIVER_COPY;

export default function DriverPodPage({ page, number, onRetake, onRemove }: Props) {
    const values = { number: String(number) };

    return (
        <li className="border-border-dark relative flex flex-col border">
            <span className="bg-background-muted relative block aspect-[3/4] w-full">
                <Image src={page.preview} alt={fillTemplate(copy.page, values)} fill unoptimized sizes="12rem" className="object-cover" />
            </span>
            <div className="border-border flex items-center justify-between gap-1 border-t px-2 py-1">
                <span className="text-text-secondary text-xs">{fillTemplate(copy.page, values)}</span>
                <span className="flex">
                    <FileTrigger acceptedFileTypes={POD_IMAGE.types} defaultCamera="environment" onSelect={onRetake}>
                        <IconButton label={fillTemplate(copy.retake, values)} icon={Camera} />
                    </FileTrigger>
                    <IconButton label={fillTemplate(copy.remove, values)} icon={Close} onPress={onRemove} />
                </span>
            </div>
        </li>
    );
}
