import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import Provider from "@/components/providers/provider";
import { haulrMono, haulrSans } from "@/public/fonts/font";
import { HAULR_BRAND } from "@/lib/data/home/brand";
import { HAULR_THEME_CLASS, HAULR_THEME_COLOR } from "@/lib/home/constants";

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    colorScheme: "light",
    themeColor: HAULR_THEME_COLOR,
};

export const metadata: Metadata = {
    title: HAULR_BRAND.metaTitle,
    description: HAULR_BRAND.metaDescription,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang="en"
            className={`${HAULR_THEME_CLASS} ${haulrSans.variable} ${haulrMono.variable} scroll-smooth motion-reduce:scroll-auto`}
        >
            <body className="bg-background text-text font-body antialiased">
                <Provider>{children}</Provider>
            </body>
        </html>
    );
}
