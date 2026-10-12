import { MAIN_CONTENT_ID } from "@/lib/constants";
import { SHELL_COPY } from "@/lib/data/shell";

export default function SkipLink() {
    return (
        <a
            href={`#${MAIN_CONTENT_ID}`}
            className="bg-text text-text-inverse focus-visible:outline-accent sr-only z-(--z-indices-tooltip) px-3 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus-visible:outline-2"
        >
            {SHELL_COPY.skipToContent}
        </a>
    );
}
