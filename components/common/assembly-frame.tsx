import clsx from "clsx";
import { ASSEMBLY } from "@/lib/auth/constants";
import { partAt } from "@/lib/auth/entry";

const EDGE = "bg-border/70 absolute";
const { trace } = ASSEMBLY;

export default function AssemblyFrame() {
    return (
        <span aria-hidden>
            <span className="haulr-shutter bg-background/85 absolute inset-0" style={partAt(ASSEMBLY.shutter)} />
            <span className={clsx(EDGE, "haulr-trace-x inset-x-0 top-0 h-px origin-left")} style={partAt(trace.top)} />
            <span className={clsx(EDGE, "haulr-trace-y inset-y-0 right-0 w-px origin-top")} style={partAt(trace.right)} />
            <span className={clsx(EDGE, "haulr-trace-x inset-x-0 bottom-0 h-px origin-right")} style={partAt(trace.bottom)} />
            <span className={clsx(EDGE, "haulr-trace-y inset-y-0 left-0 w-px origin-bottom")} style={partAt(trace.left)} />
        </span>
    );
}
