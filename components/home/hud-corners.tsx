import clsx from "clsx";

const CORNER = "border-text-muted absolute block size-3";

export default function HudCorners() {
    return (
        <span aria-hidden>
            <span className={clsx(CORNER, "-top-px -left-px border-t border-l")} />
            <span className={clsx(CORNER, "-top-px -right-px border-t border-r")} />
            <span className={clsx(CORNER, "-bottom-px -left-px border-b border-l")} />
            <span className={clsx(CORNER, "-right-px -bottom-px border-r border-b")} />
        </span>
    );
}
