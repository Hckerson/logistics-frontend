import LoginForm from "@/components/common/login-form";
import { internalPath } from "@/lib/utils/internal-path";

interface Props {
    searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
    const { next } = await searchParams;

    return (
        <main className="flex min-h-screen items-center justify-center p-3">
            <LoginForm next={internalPath(next)} />
        </main>
    );
}
