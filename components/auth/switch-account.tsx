"use client";
import { useRouter } from "next/navigation";
import { Logout } from "@carbon/icons-react";
import { CONSOLE_ACTION } from "@/lib/auth/constants";
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
        <button type="button" disabled={logout.isPending} onClick={leave} className={`${CONSOLE_ACTION} disabled:cursor-wait`}>
            {logout.isPending ? INVITE_COPY.states.switch.pending : label}
            <Logout aria-hidden className="size-4" />
        </button>
    );
}
