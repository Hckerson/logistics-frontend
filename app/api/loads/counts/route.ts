import { routes } from "@/lib/contract/routes";
import { relayRead } from "@/lib/utils/relay-read";

export const GET = relayRead(() => routes.loadsCounts());
