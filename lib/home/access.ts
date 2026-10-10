import { HAULR_BRAND } from "@/lib/data/home/brand";

export const accessLink = (signedIn: boolean) => (signedIn ? HAULR_BRAND.dashboard : HAULR_BRAND.signIn);
