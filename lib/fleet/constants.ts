export const FLEET = {
    assignmentLeadHours: 2,
    windowMinHours: 8,
    averageMph: 50,
    defaultZone: "America/Chicago",
    weekDays: 7,
    phoneDays: 3,
    staleMinutes: 5,
    searchRadiusMiles: 150,
    recommendationLimit: 5,
    reasonMax: 500,
    carrierIdMax: 64,
    noteMax: 500,
    emailMax: 254,
    laneRem: 2.75,
} as const;

export const MOVABLE_STATUSES = ["Booked", "Dispatched"] as const;

export const PLANNED_STATUSES = ["Booked", "Dispatched", "AtPickup", "InTransit", "AtDelivery", "Delivered", "PodVerified", "Invoiced", "Paid"] as const;

export const UNAVAILABLE_REASONS = ["maintenance", "timeOff", "other"] as const;

export const ALL_OPTION = "all";
