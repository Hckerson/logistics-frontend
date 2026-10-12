import AuthLinks from "@/components/auth/auth-links";
import SignedIn from "@/components/auth/signed-in";
import { HOLDING_COPY } from "@/lib/data/auth/dashboard";

const { footer } = HOLDING_COPY;

export default function DashboardPage() {
    return <SignedIn footer={<AuthLinks label={footer.label} links={footer.links} />} />;
}
