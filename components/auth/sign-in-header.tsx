import { SIGN_IN_COPY } from "@/lib/data/auth/sign-in";

export default function SignInHeader() {
    return (
        <header className="flex flex-col gap-3">
            <h1 className="text-text text-4xl leading-[1.02] font-normal tracking-tight text-balance font-stretch-(--haulr-semi)">
                {SIGN_IN_COPY.title}
            </h1>
            <p className="text-text-secondary">{SIGN_IN_COPY.lead}</p>
        </header>
    );
}
