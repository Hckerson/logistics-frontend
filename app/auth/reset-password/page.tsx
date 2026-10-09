import AuthIntro from "@/components/auth/auth-intro";
import AuthLinks from "@/components/auth/auth-links";
import ResetExpired from "@/components/auth/reset-expired";
import ResetForm from "@/components/auth/reset-form";
import { checkResetToken } from "@/lib/actions/reset-password";
import { LINK_PAGE_METADATA } from "@/lib/auth/constants";
import { RESET_COPY } from "@/lib/data/auth/reset";

interface Props {
    searchParams: Promise<{ token?: string }>;
}

export const metadata = LINK_PAGE_METADATA;

const { footer, expired } = RESET_COPY;

export default async function ResetPasswordPage({ searchParams }: Props) {
    const { token = "" } = await searchParams;
    const email = await checkResetToken(token);
    const links = <AuthLinks label={footer.label} links={footer.links} />;

    return email ? (
        <>
            <AuthIntro title={RESET_COPY.title} lead={RESET_COPY.lead} />
            <ResetForm token={token} email={email} footer={links} />
        </>
    ) : (
        <>
            <AuthIntro title={expired.title} lead={expired.lead} />
            <ResetExpired footer={links} />
        </>
    );
}
