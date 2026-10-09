import AuthIntro from "@/components/auth/auth-intro";
import AuthLinks from "@/components/auth/auth-links";
import RegisterForm from "@/components/auth/register-form";
import { ACCOUNT_SIDES } from "@/lib/constants";
import { REGISTER_COPY } from "@/lib/data/auth/register";

interface Props {
    searchParams: Promise<{ side?: string }>;
}

const { title, titleSides, lead, footer } = REGISTER_COPY;

export default async function RegisterPage({ searchParams }: Props) {
    const { side } = await searchParams;
    const preselected = ACCOUNT_SIDES.find((option) => option === side) ?? null;

    return (
        <>
            <AuthIntro title={title} lead={lead} sides={titleSides} />
            <RegisterForm side={preselected} footer={<AuthLinks label={footer.label} links={footer.links} />} />
        </>
    );
}
