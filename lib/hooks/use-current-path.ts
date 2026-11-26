import { usePathname, useSearchParams } from "next/navigation";

export const useCurrentPath = () => {
    const pathname = usePathname();
    const search = useSearchParams().toString();
    return search ? `${pathname}?${search}` : pathname;
};
