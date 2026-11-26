import type { FacilityOptionDto } from "@/lib/contract/schemas";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { LANE_COPY, POST_COPY } from "@/lib/data/loads/post-copy";
import { FREIGHT_COPY } from "@/lib/data/loads/post-freight-copy";
import { REVIEW_COPY } from "@/lib/data/loads/post-quote-copy";
import { stopWindow } from "@/lib/loads/view";
import type { FreightEntries, LaneEntries, ReviewGroup, ReviewRow, StopEntry } from "@/lib/types";
import { zoneLabel } from "@/lib/utils/date-value";
import { fillTemplate } from "@/lib/utils/fill-template";
import { grouped } from "@/lib/utils/format-number";

const present = (values: readonly (string | null | undefined)[]) => values.filter((value): value is string => Boolean(value?.trim()));

const stopDetails = ({ window, reference, instructions }: StopEntry, facility: FacilityOptionDto | undefined) =>
    present([
        facility?.name,
        facility ? `${facility.line1}, ${facility.city}, ${facility.region}` : null,
        facility && window ? `${stopWindow({ windowStart: window.start, windowEnd: window.end, facility })} ${zoneLabel(facility.timeZone)}` : null,
        reference.trim() ? `${LANE_COPY.reference}: ${reference.trim()}` : null,
        instructions,
    ]);

const laneRows = ({ stops }: LaneEntries, facilities: readonly FacilityOptionDto[]): ReviewRow[] =>
    stops.map((stop, index) => ({
        term: fillTemplate(LANE_COPY.stop, { index: String(index + 1), type: LANE_COPY.types[stop.type] }),
        details: stopDetails(
            stop,
            facilities.find((facility) => facility.id === stop.facilityId),
        ),
    }));

const freightRows = (freight: FreightEntries): ReviewRow[] => {
    const rows: [string, string | null][] = [
        [FREIGHT_COPY.equipment, freight.equipment && LOAD_COPY.equipment[freight.equipment]],
        [FREIGHT_COPY.commodity, freight.commodity],
        [FREIGHT_COPY.weight, freight.weightLb.trim() && grouped(Number(freight.weightLb))],
        [FREIGHT_COPY.pallets, freight.pallets],
        [FREIGHT_COPY.tempLegend, freight.equipment === "reefer" ? fillTemplate(REVIEW_COPY.temperature, { min: freight.tempMinF, max: freight.tempMaxF }) : null],
        [FREIGHT_COPY.hazmat, freight.hazmat ? freight.unNumber.toUpperCase() : null],
        [FREIGHT_COPY.requirements, freight.requirements.map((requirement) => FREIGHT_COPY.requirementOptions[requirement].label).join(", ")],
        [FREIGHT_COPY.poNumber, freight.poNumber],
    ];
    return rows.flatMap(([term, detail]) => (detail?.trim() ? [{ term, details: [detail.trim()] }] : []));
};

export const reviewGroups = (lane: LaneEntries, freight: FreightEntries, facilities: readonly FacilityOptionDto[]): ReviewGroup[] => [
    { step: "lane", title: POST_COPY.steps.lane, aside: fillTemplate(REVIEW_COPY.stops, { count: String(lane.stops.length) }), rows: laneRows(lane, facilities) },
    { step: "freight", title: POST_COPY.steps.freight, aside: null, rows: freightRows(freight) },
];

export const strategyRow: ReviewRow = { term: REVIEW_COPY.strategyTerm, details: [REVIEW_COPY.strategy, REVIEW_COPY.strategyDetail] };
