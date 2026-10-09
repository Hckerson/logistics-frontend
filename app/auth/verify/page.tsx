import AuthLinks from "@/components/auth/auth-links";
import VerifyEmail from "@/components/auth/verify-email";
import { LINK_PAGE_METADATA } from "@/lib/auth/constants";
import { VERIFY_COPY } from "@/lib/data/auth/verify";
import { getSession } from "@/lib/utils/session";

interface Props {
    searchParams: Promise<{ token?: string }>;
}

export const metadata = LINK_PAGE_METADATA;

const { footer } = VERIFY_COPY;

export default async function VerifyPage({ searchParams }: Props) {
    const [{ token }, session] = await Promise.all([searchParams, getSession()]);

    return (
        <VerifyEmail
            token={token ?? null}
            email={session?.email ?? null}
            footer={<AuthLinks label={footer.label} links={footer.links} />}
        />
    );
}
