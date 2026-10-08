import AuthCard from "@/components/auth/auth-card";
import AuthShell from "@/components/auth/auth-shell";
import RecoveryNav from "@/components/auth/recovery-nav";
import SignInHeader from "@/components/auth/sign-in-header";
import LoginForm from "@/components/common/login-form";
import { SIGN_IN_COPY } from "@/lib/data/auth/sign-in";
import { internalPath } from "@/lib/utils/internal-path";

interface Props {
    searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
    const { next } = await searchParams;

    return (
        <AuthShell>
            <AuthCard label={SIGN_IN_COPY.label} footer={<RecoveryNav />}>
                <SignInHeader />
                <LoginForm next={internalPath(next)} />
            </AuthCard>
        </AuthShell>
    );
}
