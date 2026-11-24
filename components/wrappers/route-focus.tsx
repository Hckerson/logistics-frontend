"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { MAIN_CONTENT_ID } from "@/lib/constants";

export default function RouteFocus() {
    const pathname = usePathname();
    const first = useRef(true);

    useEffect(() => {
        if (first.current) {
            first.current = false;
            return;
        }
        const frame = requestAnimationFrame(() => {
            const heading = document.querySelector<HTMLElement>(`#${MAIN_CONTENT_ID} h1`);
            if (!heading) return;
            if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
            heading.focus({ preventScroll: true });
        });
        return () => cancelAnimationFrame(frame);
    }, [pathname]);

    return null;
}
