import type { CollectionVehicle } from "@/lib/types";

export const FLEET_TOOLTIP = "haulr-label bg-background! text-text! border-border-dark! border! px-2! py-1!";

export const isFleetVehicle = (value: unknown): value is CollectionVehicle =>
    typeof value === "object" && value !== null && "id" in value && "label" in value && typeof value.label === "string";

export const fleetTooltip = ({ object }: { object?: unknown }) => (isFleetVehicle(object) ? { text: object.label, className: FLEET_TOOLTIP } : null);
