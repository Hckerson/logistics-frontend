import type { RefObject } from "react";

interface Props {
    labelsRef: RefObject<HTMLDivElement | null>;
    codes: readonly string[];
}

export default function MapLabels({ labelsRef, codes }: Props) {
    return (
        <div ref={labelsRef} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            {codes.map((code) => (
                <span
                    key={code}
                    data-hub={code}
                    className="absolute top-0 left-0 opacity-0 will-change-transform"
                >
                    <span className="haulr-label text-text-muted block translate-x-3 -translate-y-1/2">
                        {code}
                    </span>
                </span>
            ))}
        </div>
    );
}
