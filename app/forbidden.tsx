import AuthFrame from "@/components/auth/auth-frame";
import SystemPage from "@/components/auth/system-page";
import { SYSTEM_COPY } from "@/lib/data/system";

const { forbidden, back } = SYSTEM_COPY;

export default function Forbidden() {
    return (
        <AuthFrame>
            <SystemPage view={forbidden} back={back.signedIn} />
        </AuthFrame>
    );
}
