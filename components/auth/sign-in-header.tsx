import { SIGN_IN_COPY } from "@/lib/data/auth/sign-in";

export default function SignInHeader() {
    return (
        <header className="flex flex-col gap-4">
            <p className="haulr-label text-accent">{SIGN_IN_COPY.label}</p>
            <h1 className="haulr-title text-text">{SIGN_IN_COPY.title}</h1>
            <p className="text-text-secondary text-(length:--haulr-lead)">{SIGN_IN_COPY.lead}</p>
        </header>
    );
}
