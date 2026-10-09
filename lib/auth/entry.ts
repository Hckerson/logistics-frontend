import type { CSSProperties } from "react";
import { ENTRY } from "@/lib/auth/constants";

export const ENTRY_TIMELINE = {
    "--haulr-auth-delay": `${ENTRY.delay}s`,
    "--haulr-auth-sweep": `${ENTRY.sweep}s`,
    "--haulr-auth-rise": `${ENTRY.rise}s`,
    "--haulr-auth-ignite": `${ENTRY.ignite}s`,
    "--haulr-auth-draw": `${ENTRY.draw}s`,
} as CSSProperties;

export const bootBase = (seconds: number) => ({ "--haulr-boot-base": `${seconds}s` }) as CSSProperties;

export const partAt = (order: number) => ({ "--haulr-part": order }) as CSSProperties;
