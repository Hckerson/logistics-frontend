import Button from "@/components/ui/button";
import { ERROR_COPY, SECTION_COPY } from "@/lib/errors/constants";
import type { ActionFailure } from "@/lib/types";
import { errorMessage } from "@/lib/utils/action-result";

interface Props {
    label: string;
    failure: ActionFailure | null;
    onRetry: () => void;
}

export default function SectionFailure({ label, failure, onRetry }: Props) {
    return (
        <div className="border-error flex flex-col gap-2 border-l-2 py-1 pl-3">
            <p className="text-text text-xs">
                {SECTION_COPY.failed.replace("{label}", label)} {failure ? errorMessage(failure) : ERROR_COPY.offline}
            </p>
            {failure?.correlationId ? (
                <p className="text-text-muted font-mono text-xs">{`${SECTION_COPY.reference} ${failure.correlationId}`}</p>
            ) : null}
            <Button tone="quiet" size="sm" onClick={onRetry} className="self-start">
                {SECTION_COPY.retry}
            </Button>
        </div>
    );
}
