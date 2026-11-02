import { routes } from "@/lib/contract/routes";
import { laneRelay } from "@/lib/quotes/relay";

export const GET = laneRelay(routes.pricingTrend);
