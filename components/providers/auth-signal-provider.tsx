"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import type { AuthSignal } from "@/lib/types";

interface SignalState {
    signal: AuthSignal;
    setSignal: (signal: AuthSignal) => void;
}

const AuthSignalContext = createContext<SignalState>({ signal: "origin", setSignal: () => undefined });

export const useAuthSignal = () => useContext(AuthSignalContext);

export default function AuthSignalProvider({ children }: { children: ReactNode }) {
    const [signal, setSignal] = useState<AuthSignal>("origin");

    return <AuthSignalContext value={{ signal, setSignal }}>{children}</AuthSignalContext>;
}
