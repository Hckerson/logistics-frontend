import type { LaneSample } from "@/lib/types";

export const LANES_COPY = {
    label: "Lanes moving now",
    title: "Real loads, priced before anyone calls.",
    note: "Sample figures. Placeholder data for a design study.",
    columns: { rate: "Rate", transit: "Transit", onTime: "On time" },
} as const;

export const LANE_SAMPLES: readonly LaneSample[] = [
    { id: "chi-dal", from: "CHI", to: "DAL", equipment: "Dry van", rate: "$2,340", transit: "2 days", onTime: "97%" },
    { id: "lax-phx", from: "LAX", to: "PHX", equipment: "Reefer", rate: "$1,180", transit: "1 day", onTime: "95%" },
    { id: "atl-clt", from: "ATL", to: "CLT", equipment: "Dry van", rate: "$690", transit: "1 day", onTime: "98%" },
    { id: "hou-mem", from: "HOU", to: "MEM", equipment: "Flatbed", rate: "$1,420", transit: "1 day", onTime: "94%" },
    { id: "sea-slc", from: "SEA", to: "SLC", equipment: "Reefer", rate: "$2,760", transit: "2 days", onTime: "93%" },
    { id: "nyc-chi", from: "NYC", to: "CHI", equipment: "Dry van", rate: "$2,910", transit: "2 days", onTime: "96%" },
    { id: "den-kci", from: "DEN", to: "KCI", equipment: "Flatbed", rate: "$1,560", transit: "1 day", onTime: "95%" },
    { id: "mia-jax", from: "MIA", to: "JAX", equipment: "Reefer", rate: "$820", transit: "1 day", onTime: "97%" },
];
