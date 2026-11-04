"use client";
import { useRouter } from "next/navigation";
import { Logout } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import { INVITE_COPY } from "@/lib/data/auth/invite";
import { useLogout } from "@/lib/hooks/use-logout";

interface Props {
    label: string;
    then: string;
}

export default function SwitchAccount({ label, then }: Props) {
    const router = useRouter();
    const logout = useLogout();

    const leave = () =>
        logout.mutate(undefined, {
            onSettled: () => {
                router.replace(then);
                router.refresh();
            },
        });

    return (
        <Button size="wide" trailing={Logout} pending={logout.isPending} pendingLabel={INVITE_COPY.states.switch.pending} onPress={leave}>
            {label}
        </Button>
    );
}
