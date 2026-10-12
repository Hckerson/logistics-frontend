import type { ChoiceOption, Equipment } from "@/lib/types";
import { registerRoute } from "@/lib/constants";
import { AUTH_COPY } from "@/lib/data/auth/shared";
import { CLOSE_COPY } from "@/lib/data/home/close";
import { TREND } from "@/lib/quotes/constants";

export const ESTIMATOR_COPY = {
    meta: {
        title: "Lane rate estimator · Haulr",
        description: "Market rate, confidence range and 30-day trend for any truckload lane.",
    },
    intro: {
        eyebrow: "Lane rate estimator",
        title: "Price a lane.",
        lead: "The market rate for any lane, how sure we are about it, and which way it's heading.",
    },
    note: AUTH_COPY.note,
    summary: AUTH_COPY.summary,
    query: { label: "Lane query", ready: "Ready", pending: "Estimating", done: "Estimated", held: "Held" },
    fields: {
        origin: { index: "01", label: "Pickup city", placeholder: CLOSE_COPY.fields.origin.placeholder },
        destination: { index: "02", label: "Delivery city", placeholder: CLOSE_COPY.fields.destination.placeholder },
        equipment: { index: "03", legend: "Equipment" },
        date: { index: "04", label: "Pickup date", hint: "Today or later" },
    },
    equipment: CLOSE_COPY.equipment satisfies readonly ChoiceOption<Equipment>[],
    places: {
        list: "{field} suggestions",
        none: "No match. Check the spelling, or try a nearby city.",
        one: "1 suggestion",
        other: "{count} suggestions",
    },
    submit: "Estimate this lane",
    pending: "Estimating…",
    errors: {
        origin: { missing: "Enter a pickup city.", long: "Shorten the pickup city.", unresolved: "Choose a pickup city from the list." },
        destination: {
            missing: "Enter a delivery city.",
            long: "Shorten the delivery city.",
            same: "Pick a delivery city that isn't the pickup city.",
            unresolved: "Choose a delivery city from the list.",
        },
        equipment: { missing: "Choose the equipment." },
        date: { missing: "Enter a pickup date.", past: "Pick today or a later date." },
    },
    result: {
        label: "Estimate",
        idle: "Waiting",
        empty: "Two cities, a trailer and a pickup day. The rate comes back with how sure we are about it.",
        confidence: { high: "High confidence", medium: "Medium confidence", low: "Low confidence" },
        range: "Likely range",
        lane: "{origin} to {destination}",
        announce: "Estimate ready: between {low} and {high}.",
        perMile: "{rate} per mile",
        miles: "{miles} mi",
        basis: "Based on {samples} comparable loads in the last 30 days and the {equipment} market index.",
        how: "How this is estimated",
        howBody:
            "We price the lane from recent loads that ran it with the same equipment, then adjust for the pickup day. A wider range means fewer loads to learn from.",
        thin: "Few loads ran this lane recently, so the range is wide.",
        notQuote: "An estimate, not a quote. Only a bookable quote holds its price.",
        slow: "Still estimating…",
    },
    failure: {
        rateLimited: "Too many estimates from this connection. Try again in {time}.",
        rateLimitedUnknown: "Too many estimates from this connection. Wait a minute, then try again.",
        unavailable: "Estimates are unavailable right now. Your entries are kept.",
        timeout: "The estimate took too long. Your entries are kept.",
        server: "The estimate didn't come back. Your entries are kept.",
        retry: "Try again",
        signUp: { label: "Create a free account for more estimates", href: registerRoute("shipper") },
    },
    actions: {
        post: "Get a bookable quote for this lane",
        custom: "Ask for a custom quote",
        save: "Save estimate",
        saving: "Saving…",
        saved: "Saved to your estimates",
        saveFailed: "Couldn't save. Try again.",
    },
    trend: {
        label: "30-day trend",
        status: { up: "Rising", down: "Easing", flat: "Steady" },
        up: "Up {change} over {days} days",
        down: "Down {change} over {days} days",
        flat: "Flat over {days} days",
        thin: `Not enough history yet. A trend needs at least ${TREND.minimumDays} days of loads; this lane has {days}.`,
        failed: "The trend didn't load. The estimate above is unaffected.",
        chart: "Rate per mile over the last {days} days. {direction}.",
        table: "Show daily rates",
        caption: "Daily rate per mile and loads counted",
        columns: { date: "Date", rate: "Per mile", samples: "Loads" },
    },
} as const;
