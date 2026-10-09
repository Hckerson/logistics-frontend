import AuthIntro from "@/components/auth/auth-intro";
import AuthLinks from "@/components/auth/auth-links";
import ForgotForm from "@/components/auth/forgot-form";
import { FORGOT_COPY } from "@/lib/data/auth/forgot";

const { title, lead, footer } = FORGOT_COPY;

export default function ForgotPasswordPage() {
    return (
        <>
            <AuthIntro title={title} lead={lead} />
            <ForgotForm footer={<AuthLinks label={footer.label} links={footer.links} />} />
        </>
    );
}
