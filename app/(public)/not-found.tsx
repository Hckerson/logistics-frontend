import SystemColumn from "@/components/auth/system-column";
import SystemPage from "@/components/auth/system-page";
import { SYSTEM_PLACEMENT } from "@/lib/auth/constants";
import { SYSTEM_COPY } from "@/lib/data/system";
import { getSession } from "@/lib/utils/session";

const { notFound, back } = SYSTEM_COPY;

export default async function PublicNotFound() {
    const session = await getSession();

    return (
        <SystemColumn className={SYSTEM_PLACEMENT.public}>
            <SystemPage view={notFound} back={session ? back.signedIn : back.signedOut} />
        </SystemColumn>
    );
}
