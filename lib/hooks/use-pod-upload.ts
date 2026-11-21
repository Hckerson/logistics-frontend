import { nanoid } from "nanoid";
import { useEffect, useRef, useState } from "react";
import { useAnnounce } from "@/components/providers/announcer-provider";
import { useReplay } from "@/components/providers/offline-queue-provider";
import { DRIVER_COPY } from "@/lib/data/driver/copy";
import { POD_IMAGE, POD_LIMITS } from "@/lib/driver/constants";
import type { PodPage, QueueEntry } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";
import { checkImage } from "@/lib/utils/image-check";
import { encodeJson, offlineQueue } from "@/lib/utils/offline-queue";

interface Submission {
    receiverName: string;
    osdNotes: string;
}

const { pod: copy } = DRIVER_COPY;

export function usePodUpload(owner: string, loadId: string) {
    const announce = useAnnounce();
    const replay = useReplay();
    const [pages, setPages] = useState<PodPage[]>([]);
    const [rejection, setRejection] = useState<string | null>(null);
    const [checking, setChecking] = useState(false);
    const previews = useRef(new Set<string>());

    useEffect(() => {
        const urls = previews.current;
        return () => urls.forEach((url) => URL.revokeObjectURL(url));
    }, []);

    const add = async (file: File, replacing?: string) => {
        if (!replacing && pages.length >= POD_LIMITS.maxPages) return setRejection(copy.tooMany);
        setChecking(true);
        const checked = await checkImage(file).catch(() => null);
        setChecking(false);
        if (!checked?.ok) return setRejection(copy.rejected[checked?.reason ?? "type"]);
        setRejection(null);
        const preview = URL.createObjectURL(checked.blob);
        previews.current.add(preview);
        const page: PodPage = { id: nanoid(), blob: checked.blob, preview };
        const next = replacing ? pages.map((known) => (known.id === replacing ? page : known)) : [...pages, page];
        setPages(next);
        announce({ message: fillTemplate(copy.captured, { number: String(next.findIndex((known) => known.id === page.id) + 1) }) });
    };

    const remove = (id: string) => setPages((current) => current.filter((page) => page.id !== id));

    const submit = async ({ receiverName, osdNotes }: Submission) => {
        const base = { owner, loadId, failure: null, event: null, target: null };
        for (const page of pages) {
            const entry: QueueEntry = { ...base, id: page.id, kind: "podPage", createdAt: new Date().getTime(), page: { contentType: POD_IMAGE.outputType, sizeBytes: page.blob.size } };
            await offlineQueue.add(entry, new Uint8Array(await page.blob.arrayBuffer()));
        }
        const id = nanoid();
        const body = { id, pageIds: pages.map((page) => page.id), receiverName: receiverName.trim(), ...(osdNotes.trim() ? { osdNotes: osdNotes.trim() } : {}) };
        await offlineQueue.add({ ...base, id, kind: "pod", createdAt: new Date().getTime(), page: null }, encodeJson(body));
        setPages([]);
        void replay();
    };

    return { pages, rejection, checking, add, remove, submit };
}
