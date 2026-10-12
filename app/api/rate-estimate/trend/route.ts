import { unpublishedRoutes } from "@/lib/api-routes";
import { laneRelay } from "@/lib/quotes/relay";

export const GET = laneRelay(unpublishedRoutes.pricingTrend);
