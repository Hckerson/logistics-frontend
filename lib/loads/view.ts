import type { LoadDto, StopDto } from "@/lib/contract/schemas";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { clockTime, dayName, shortTime } from "@/lib/tracking/view";
import type { MapStop } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";
import { grouped } from "@/lib/utils/format-number";

const { header, equipment } = LOAD_COPY;

export const placeName = ({ facility }: Pick<StopDto, "facility">) => `${facility.city}, ${facility.region}`;

export const currentStop = (stops: readonly StopDto[]) => stops.find((stop) => !stop.departedAt) ?? null;

export const stopWindow = ({ windowStart, windowEnd, facility: { timeZone } }: Pick<StopDto, "windowStart" | "windowEnd" | "facility">) =>
    `${dayName(windowStart, timeZone)} · ${shortTime(windowStart, timeZone)}–${clockTime(windowEnd, timeZone)}`;

export const stopMoment = (iso: string, timeZone: string) => `${dayName(iso, timeZone)} · ${clockTime(iso, timeZone)}`;

export const arrivedLate = ({ arrivedAt, windowEnd }: Pick<StopDto, "arrivedAt" | "windowEnd">) =>
    arrivedAt !== null && Date.parse(arrivedAt) > Date.parse(windowEnd);

export const awaitingOf = ({ status, shipper, carrier, stops }: LoadDto) => {
    const stop = currentStop(stops) ?? stops[stops.length - 1];
    return fillTemplate(LOAD_COPY.awaiting[status], { shipper: shipper.name, carrier: carrier?.name ?? header.unbooked, city: stop.facility.city });
};

export const loadFacts = (load: LoadDto) =>
    [
        equipment[load.equipment],
        load.commodity,
        fillTemplate(header.weight, { weight: grouped(load.weightLb) }),
        load.pallets === null ? null : fillTemplate(header.pallets, { count: grouped(load.pallets) }),
        load.tempMinF === null || load.tempMaxF === null ? null : fillTemplate(header.temp, { min: String(load.tempMinF), max: String(load.tempMaxF) }),
        load.hazmat ? header.hazmat : null,
    ].filter((fact) => fact !== null);

export const loadMapStops = (stops: readonly StopDto[]): MapStop[] =>
    stops.map(({ facility, type, departedAt }) => ({ position: [facility.longitude, facility.latitude], type, done: departedAt !== null }));
