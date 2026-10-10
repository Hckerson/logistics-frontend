import { useEffect, useState } from "react";
import { SECTION_SPY } from "@/lib/legal/constants";

export function useActiveSection(ids: readonly string[]) {
    const [active, setActive] = useState(ids[0]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const seen = entries.find((entry) => entry.isIntersecting);
            if (seen) setActive(seen.target.id);
        }, SECTION_SPY);
        ids.forEach((id) => {
            const section = document.getElementById(id);
            if (section) observer.observe(section);
        });
        return () => observer.disconnect();
    }, [ids]);

    return active;
}
