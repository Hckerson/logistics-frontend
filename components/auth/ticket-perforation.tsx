import { ASSEMBLY } from "@/lib/auth/constants";
import { partAt } from "@/lib/auth/entry";

const NOTCH = "haulr-pop bg-background border-border/70 absolute top-0 size-4 -translate-y-1/2 rounded-full";

export default function TicketPerforation() {
    return (
        <div
            aria-hidden
            className="haulr-boot border-border-dark relative -mx-5 border-t border-dashed"
            style={partAt(ASSEMBLY.perforation)}
        >
            <span className={`${NOTCH} -left-2 border-r`} style={partAt(ASSEMBLY.notch)} />
            <span className={`${NOTCH} -right-2 border-l`} style={partAt(ASSEMBLY.notch)} />
        </div>
    );
}
