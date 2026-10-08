import AuthIntro from "@/components/auth/auth-intro";
import AuthLinks from "@/components/auth/auth-links";
import AuthShell from "@/components/auth/auth-shell";
import LoginForm from "@/components/common/login-form";
import { SIGN_IN_COPY } from "@/lib/data/auth/sign-in";
import { internalPath } from "@/lib/utils/internal-path";

interface Props {
    searchParams: Promise<{ next?: string }>;
}

const { title, lead, recovery } = SIGN_IN_COPY;

export default async function LoginPage({ searchParams }: Props) {
    const { next } = await searchParams;

    return (
        <AuthShell intro={<AuthIntro title={title} lead={lead} />}>
            <LoginForm next={internalPath(next)} footer={<AuthLinks label={recovery.label} links={recovery.links} />} />
        </AuthShell>
    );
}
