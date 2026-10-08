import AuthShell from "@/components/auth/auth-shell";
import RecoveryNav from "@/components/auth/recovery-nav";
import SignInHeader from "@/components/auth/sign-in-header";
import LoginForm from "@/components/common/login-form";
import { internalPath } from "@/lib/utils/internal-path";

interface Props {
    searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
    const { next } = await searchParams;

    return (
        <AuthShell>
            <SignInHeader />
            <LoginForm next={internalPath(next)} />
            <RecoveryNav />
        </AuthShell>
    );
}
