import { redirect } from "next/navigation";
import AuthLinks from "@/components/auth/auth-links";
import SignedIn from "@/components/auth/signed-in";
import { DASHBOARD_ROUTE, loginRoute } from "@/lib/constants";
import { HOLDING_COPY } from "@/lib/data/auth/dashboard";
import { getSession } from "@/lib/utils/session";

const { footer } = HOLDING_COPY;

export default async function DashboardPage() {
    const session = await getSession();
    if (!session) redirect(loginRoute(DASHBOARD_ROUTE));

    return <SignedIn email={session.email} footer={<AuthLinks label={footer.label} links={footer.links} />} />;
}
