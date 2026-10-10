import type { HelpArticle } from "@/lib/types";

export const FREIGHT_ARTICLES: readonly HelpArticle[] = [
    {
        slug: "create-account",
        category: "getting-started",
        title: "Create your Haulr account",
        summary: "Pick your side, confirm your email and you're in.",
        updated: "2026-09-24",
        steps: [
            { id: "pick-side", title: "Pick your side", body: ["Choose whether you ship freight or haul it. You can add the other side later from your organisation settings."] },
            { id: "details", title: "Enter your details", body: ["Use your work email. Your password needs at least 8 characters."] },
            { id: "confirm", title: "Confirm your email", body: ["Open the link we send you. It works for 24 hours, on any device."] },
        ],
        related: ["verify-email", "post-a-load"],
    },
    {
        slug: "post-a-load",
        category: "shipping",
        title: "Post your first load",
        summary: "Get a price for the lane, then post it to carriers.",
        updated: "2026-09-30",
        steps: [
            { id: "price", title: "Price the lane", body: ["Enter the pickup and delivery cities and the equipment. The estimate shows a fair range for that lane today."] },
            { id: "details", title: "Add the load details", body: ["Add weight, pickup window and any accessorials. Facilities you've saved fill in their hours."] },
            { id: "post", title: "Post it", body: ["Carriers see the load straight away. You're notified when one books it."] },
        ],
        related: ["share-tracking", "read-an-invoice"],
    },
    {
        slug: "book-a-load",
        category: "hauling",
        title: "Find and book a load",
        summary: "Search the board by lane and book in one step.",
        updated: "2026-09-27",
        steps: [
            { id: "search", title: "Search the board", body: ["Filter by origin, destination, equipment and pickup date. Save a search to be told when matching loads appear."] },
            { id: "check", title: "Check the details", body: ["Open a load to see the rate, stops and the shipper's payment record."] },
            { id: "book", title: "Book it", body: ["Booking sends you a rate confirmation to sign. The load is yours once it's signed."] },
        ],
        related: ["record-a-stop", "carrier-documents"],
    },
    {
        slug: "record-a-stop",
        category: "drivers",
        title: "Record a stop from the cab",
        summary: "Check in, check out and capture proof of delivery.",
        updated: "2026-09-21",
        steps: [
            { id: "arrive", title: "Check in when you arrive", body: ["Tap Arrived at the stop. Your position is attached so detention can be timed."] },
            { id: "pod", title: "Capture proof of delivery", body: ["Photograph the signed paperwork. It uploads when you have signal; nothing is lost offline."] },
            { id: "depart", title: "Check out", body: ["Tap Departed. The next stop opens on its own."] },
        ],
        related: ["share-tracking"],
    },
    {
        slug: "share-tracking",
        category: "tracking",
        title: "Share live tracking with a customer",
        summary: "Send a link that shows where the load is, without an account.",
        updated: "2026-10-02",
        steps: [
            { id: "open", title: "Open the load", body: ["Live position and ETA appear once the driver starts the trip."] },
            { id: "share", title: "Copy the tracking link", body: ["The link shows the route, position and ETA only. Rates and documents stay private."] },
            { id: "stop", title: "Turn the link off", body: ["Links expire when the load is delivered. You can turn one off sooner from the same menu."] },
        ],
        related: ["post-a-load", "file-a-claim"],
    },
];
