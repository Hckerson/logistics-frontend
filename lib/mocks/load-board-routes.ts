import { routes } from "@/lib/contract/routes";
import { bookLoad, viewBooking } from "@/lib/mocks/booking";
import { searchBoard } from "@/lib/mocks/load-board";
import { pathOf } from "@/lib/mocks/match-route";
import type { MockHandler } from "@/lib/types";

export const LOAD_BOARD_HANDLERS: Record<string, MockHandler> = {
    [`GET ${pathOf(routes.loadBoardSearch())}`]: searchBoard,
    [`GET ${routes.loadsBooking(":loadId")}`]: viewBooking,
    [`POST ${routes.loadsBook(":loadId")}`]: bookLoad,
};
