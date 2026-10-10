import AuthLinks from "@/components/auth/auth-links";
import CodeChallenge from "@/components/auth/code-challenge";
import VerifyEmail from "@/components/auth/verify-email";
import { checkMfaChallenge } from "@/lib/actions/mfa-challenge";
import { LINK_PAGE_METADATA } from "@/lib/auth/constants";
import { DASHBOARD_ROUTE, MFA_STEP } from "@/lib/constants";
import { VERIFY_COPY } from "@/lib/data/auth/verify";
import { internalPath } from "@/lib/utils/internal-path";
import { getSession } from "@/lib/utils/session";

interface Props {
    searchParams: Promise<{ token?: string; step?: string; next?: string }>;
}

export const metadata = LINK_PAGE_METADATA;

const { footer } = VERIFY_COPY;

export default async function VerifyPage({ searchParams }: Props) {
    const { token, step, next } = await searchParams;
    const links = <AuthLinks label={footer.label} links={footer.links} />;

    if (step === MFA_STEP) {
        return <CodeChallenge challenge={await checkMfaChallenge()} next={internalPath(next, DASHBOARD_ROUTE)} footer={links} />;
    }

    const session = await getSession();
    return <VerifyEmail token={token ?? null} email={session?.email ?? null} footer={links} />;
}
