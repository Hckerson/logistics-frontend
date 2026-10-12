"use client";
import { createContext, useContext, type ReactNode } from "react";
import type { SessionUser } from "@/lib/types";

const SessionContext = createContext<SessionUser | null>(null);

export const useSession = () => useContext(SessionContext);

export default function SessionProvider({ user, children }: { user: SessionUser | null; children: ReactNode }) {
    return <SessionContext value={user}>{children}</SessionContext>;
}
