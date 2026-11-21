import { redirect } from "next/navigation";
import AuthLinks from "@/components/auth/auth-links";
import SignedIn from "@/components/auth/signed-in";
import { requireUser } from "@/lib/auth/guards";
import { roleHome } from "@/lib/auth/role-home";
import { HOLDING_COPY } from "@/lib/data/auth/dashboard";

const { footer } = HOLDING_COPY;

export default async function DashboardPage() {
    const home = roleHome((await requireUser()).roles);
    if (home) redirect(home);
    return <SignedIn footer={<AuthLinks label={footer.label} links={footer.links} />} />;
}
