import AuthIntro from "@/components/auth/auth-intro";
import AuthLinks from "@/components/auth/auth-links";
import ConsoleLink from "@/components/auth/console-link";
import SystemPanel from "@/components/auth/system-panel";
import { SYSTEM_COPY } from "@/lib/data/system";
import type { SystemView } from "@/lib/types";

interface Props {
    view: SystemView;
    back: { label: string; href: string };
}

const { footer } = SYSTEM_COPY;

export default function SystemPage({ view, back }: Props) {
    return (
        <>
            <AuthIntro title={view.title} lead={view.lead} />
            <SystemPanel view={view} footer={<AuthLinks label={footer.label} links={footer.links} />}>
                <ConsoleLink href={back.href} label={back.label} />
            </SystemPanel>
        </>
    );
}
