export const CLOSE_COPY = {
    label: "Get a price",
    title: "Price your lane.",
    lead: "Two cities and a trailer type. The rate comes back with its confidence range.",
    note: "Try Chicago, IL and Dallas, TX.",
    fields: {
        origin: { name: "origin", label: "Pickup city", placeholder: "Chicago, IL" },
        destination: { name: "destination", label: "Delivery city", placeholder: "Dallas, TX" },
        equipment: { name: "equipment", label: "Equipment" },
    },
    equipment: [
        { value: "dry-van", label: "Dry van" },
        { value: "reefer", label: "Reefer" },
        { value: "flatbed", label: "Flatbed" },
    ],
    submit: "Get a price",
    ticket: {
        label: "Your lane",
        note: "Sample preview",
        idle: "Type two cities to light the lane.",
        unit: "miles, straight line.",
    },
    listId: "haulr-hubs",
} as const;
