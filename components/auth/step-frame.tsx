"use client";
import { useState, type ReactNode } from "react";
import AssemblyProvider from "@/components/providers/assembly-provider";
import { bootBase } from "@/lib/auth/entry";

interface Props {
    base: number;
    children: ReactNode;
}

export default function StepFrame({ base, children }: Props) {
    const [frozen] = useState(base);

    return (
        <div style={bootBase(frozen)}>
            <AssemblyProvider boot={frozen}>{children}</AssemblyProvider>
        </div>
    );
}
