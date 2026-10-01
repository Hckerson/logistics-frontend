import {
    Archivo,
    Fraunces,
    IBM_Plex_Mono,
    JetBrains_Mono,
    Libre_Franklin,
} from "next/font/google";

const display = Fraunces({
    subsets: ["latin"],
    style: ["normal", "italic"],
    variable: "--nf-display",
    display: "swap",
    fallback: ["Georgia", "Times New Roman", "serif"],
});

const sans = Libre_Franklin({
    subsets: ["latin"],
    variable: "--nf-body",
    display: "swap",
    fallback: ["system-ui", "Segoe UI", "sans-serif"],
});

const mono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--nf-mono",
    display: "swap",
    fallback: ["ui-monospace", "monospace"],
});

const haulrSans = Archivo({
    subsets: ["latin"],
    axes: ["wdth"],
    variable: "--nf-haulr-sans",
    display: "swap",
    fallback: ["system-ui", "Segoe UI", "sans-serif"],
});

const haulrMono = IBM_Plex_Mono({
    subsets: ["latin"],
    weight: ["400", "500"],
    variable: "--nf-haulr-mono",
    display: "swap",
    fallback: ["ui-monospace", "monospace"],
});

export { display, sans, mono, haulrSans, haulrMono };
