import SystemColumn from "@/components/auth/system-column";
import SystemPage from "@/components/auth/system-page";
import { SYSTEM_PLACEMENT } from "@/lib/auth/constants";
import { SYSTEM_COPY } from "@/lib/data/system";

const { notFound, back } = SYSTEM_COPY;

export default function LoadNotFound() {
    return (
        <SystemColumn className={SYSTEM_PLACEMENT.workspace}>
            <SystemPage view={notFound} back={back.signedIn} />
        </SystemColumn>
    );
}
