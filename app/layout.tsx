import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import RootDocument from "@/components/common/root-document";
import Provider from "@/components/providers/provider";
import { HAULR_BRAND } from "@/lib/data/home/brand";
import { HAULR_THEME_COLOR } from "@/lib/home/constants";

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    colorScheme: "dark",
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
        <RootDocument>
            <Provider>{children}</Provider>
        </RootDocument>
    );
}
