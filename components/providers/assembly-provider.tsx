"use client";
import { createContext, useContext, type ReactNode } from "react";

const AssemblyContext = createContext(0);

export const useAssembly = () => useContext(AssemblyContext);

export default function AssemblyProvider({ boot, children }: { boot: number; children: ReactNode }) {
    return <AssemblyContext value={boot}>{children}</AssemblyContext>;
}
