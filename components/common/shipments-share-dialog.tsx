"use client";
import Button from "@/components/ui/button";
import CopyButton from "@/components/ui/copy-button";
import Dialog from "@/components/ui/dialog";
import { appRoutes } from "@/lib/app-routes";
import { SHIPMENTS_COPY } from "@/lib/data/loads/shipments";
import { useShareTrackingLinks } from "@/lib/hooks/use-bulk-tracking";
import { TRACKING } from "@/lib/loads/constants";
import { UI_COPY } from "@/lib/ui/copy";
import { errorMessage, failureFrom } from "@/lib/utils/action-result";
import { fillTemplate } from "@/lib/utils/fill-template";
import { pluralize } from "@/lib/utils/plural";

interface Props {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    loadIds: readonly string[];
}

const { share } = SHIPMENTS_COPY;
const trackingUrl = (token: string) => `${window.location.origin}${appRoutes.tracking(token)}`;

export default function ShipmentsShareDialog({ isOpen, onOpenChange, loadIds }: Props) {
    const mutation = useShareTrackingLinks();
    const results = mutation.data;
    const shared = results?.flatMap(({ loadId, link }) => (link ? [{ loadId, url: trackingUrl(link.token) }] : [])) ?? [];
    const failed = results?.flatMap(({ loadId, failure }) => (failure ? [{ loadId, message: failure.message }] : [])) ?? [];
    const failure = mutation.isError ? failureFrom(mutation.error) : null;
    const close = () => onOpenChange(false);

    const footer = results ? (
        <div className="flex items-center justify-between gap-2">
            {shared.length > 0 ? <CopyButton value={shared.map(({ url }) => url).join("\n")} label={share.copyAll} done={share.copied} /> : <span />}
            <Button size="sm" onPress={close}>
                {SHIPMENTS_COPY.close}
            </Button>
        </div>
    ) : (
        <div className="flex items-center justify-end gap-2">
            <Button tone="ghost" size="sm" onPress={close}>
                {UI_COPY.cancel}
            </Button>
            <Button size="sm" pending={mutation.isPending} pendingLabel={share.pending} onPress={() => mutation.mutate({ loadIds: [...loadIds] })}>
                {failure ? SHIPMENTS_COPY.retry : share.confirm}
            </Button>
        </div>
    );

    return (
        <Dialog isOpen={isOpen} onOpenChange={onOpenChange} title={share.title} width="md" footer={footer}>
            {results ? (
                <div className="flex flex-col gap-3">
                    <p role="status" className="text-text text-xs">
                        {[shared.length > 0 && pluralize(shared.length, share.done), failed.length > 0 && pluralize(failed.length, share.failed)].filter(Boolean).join(" · ")}
                    </p>
                    <ul className="border-border-light max-h-64 overflow-y-auto border-t">
                        {[...shared, ...failed].map((entry) => (
                            <li key={entry.loadId} className="border-border-light flex items-baseline justify-between gap-4 border-b py-2 text-xs">
                                <span className="text-text font-mono">{entry.loadId}</span>
                                {"url" in entry ? (
                                    <span className="text-text-secondary min-w-0 truncate font-mono">{entry.url}</span>
                                ) : (
                                    <span className="text-signal-danger">{entry.message}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="flex flex-col gap-2 text-xs">
                    <p className="text-text">{pluralize(loadIds.length, share.scope)}</p>
                    <p className="text-text-muted">{fillTemplate(share.expiry, { days: String(TRACKING.linkExpiryDays) })}</p>
                    {failure ? (
                        <p role="alert" className="text-signal-danger">
                            {errorMessage(failure) || share.failedRequest}
                        </p>
                    ) : null}
                </div>
            )}
        </Dialog>
    );
}
