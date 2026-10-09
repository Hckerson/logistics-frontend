"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ENTRY } from "@/lib/auth/constants";
import type { AccountSide, AuthSignal } from "@/lib/types";

interface SignalState {
    signal: AuthSignal;
    side: AccountSide | null;
    booted: boolean;
    leg: number;
    setSignal: (signal: AuthSignal) => void;
    setLeg: (leg: number) => void;
    setSide: (side: AccountSide | null) => void;
}

const AuthSignalContext = createContext<SignalState>({
    signal: "origin",
    side: null,
    booted: false,
    leg: 0,
    setSignal: () => undefined,
    setLeg: () => undefined,
    setSide: () => undefined,
});

export const useAuthSignal = () => useContext(AuthSignalContext);

export default function AuthSignalProvider({ children }: { children: ReactNode }) {
    const [signal, setSignal] = useState<AuthSignal>("origin");
    const [side, setSide] = useState<AccountSide | null>(null);
    const [booted, setBooted] = useState(false);
    const [leg, setLeg] = useState(0);

    useEffect(() => {
        const settle = setTimeout(() => setBooted(true), ENTRY.settle * 1000);
        return () => clearTimeout(settle);
    }, []);

    return (
        <AuthSignalContext value={{ signal, side, booted, leg, setSignal, setSide, setLeg }}>{children}</AuthSignalContext>
    );
}
