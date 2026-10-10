import type { ReactNode } from "react";
import { haulrMono, haulrSans } from "@/public/fonts/font";
import { HAULR_THEME_CLASS } from "@/lib/home/constants";

interface Props {
    children: ReactNode;
}

export default function RootDocument({ children }: Props) {
    return (
        <html
            lang="en"
            className={`${HAULR_THEME_CLASS} ${haulrSans.variable} ${haulrMono.variable} scroll-smooth motion-reduce:scroll-auto`}
        >
            <body className="bg-background text-text font-body antialiased">{children}</body>
        </html>
    );
}
