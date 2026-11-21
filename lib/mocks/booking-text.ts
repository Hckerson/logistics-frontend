import type { RateConfirmationDto } from "@/lib/contract/schemas";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { MOCK_BOOKING, MOCK_RATE_CONFIRMATION as TEXT } from "@/lib/data/mocks/booking";
import { MOCK_FACILITIES } from "@/lib/data/mocks/facilities";
import { MOCK_ORGANISATIONS } from "@/lib/data/mocks/team";
import { CURRENCY } from "@/lib/loads/constants";
import { clockTime, dayName, shortTime } from "@/lib/tracking/view";
import type { MockLoad } from "@/lib/types";
import { formatMoney } from "@/lib/utils/currency";
import { fillTemplate } from "@/lib/utils/fill-template";
import { grouped } from "@/lib/utils/format-number";

const money = (cents: number) => formatMoney(cents, CURRENCY);

export const bookingCopy = {
    standing: (blocked: boolean) => (blocked ? "Your carrier account is under compliance review, so booking is paused." : "Carrier account in good standing."),
    insurance: (minimum: number, cover: number) =>
        cover >= minimum ? `Cargo cover ${money(cover)} meets the ${money(minimum)} this load requires.` : `Cargo cover of ${money(minimum)} required; ${money(cover)} on file.`,
    equipment: (kind: MockLoad["equipment"], fits: boolean) =>
        fits ? `${LOAD_COPY.equipment[kind]} on your fleet.` : `${LOAD_COPY.equipment[kind]} required; none on your fleet.`,
    availability: (posted: boolean) => (posted ? "Still on the board." : "No longer available."),
    gone: "This load is no longer on the board",
    taken: "This load was just booked by another carrier",
    changed: "The rate confirmation changed since you opened it",
    signer: "The typed name doesn't match the name on your account",
} as const;

const windowOf = (start: string, end: string, zone: string) => `${dayName(start, zone)} ${shortTime(start, zone)}–${clockTime(end, zone)}`;

export const rateConfirmationOf = (load: MockLoad, carrier: string, pay: number, miles: number): RateConfirmationDto => {
    const { terms } = MOCK_BOOKING;
    const stops = load.stops
        .map((stop) => {
            const facility = MOCK_FACILITIES[stop.facility];
            return fillTemplate(TEXT.stop, {
                sequence: String(stop.sequence),
                type: stop.type === "pickup" ? "Pickup" : "Delivery",
                name: facility.name,
                address: `${facility.line1}, ${facility.city}, ${facility.region} ${facility.postalCode}`,
                window: windowOf(stop.windowStart, stop.windowEnd, facility.timeZone),
                reference: stop.reference ? `, reference ${stop.reference}` : "",
            });
        })
        .join(" ");
    const temperature = load.tempMinF !== null && load.tempMaxF !== null ? `, kept at ${load.tempMinF}–${load.tempMaxF}°F` : "";
    const section = ({ heading, body }: { heading: string; body: string }, values: Record<string, string> = {}) => ({ heading, body: fillTemplate(body, values) });

    return {
        version: MOCK_BOOKING.rateConfirmationVersion,
        fileName: fillTemplate(TEXT.fileName, { load: load.id, version: String(MOCK_BOOKING.rateConfirmationVersion) }),
        issuedAt: load.updatedAt,
        sections: [
            section(TEXT.parties, { shipper: MOCK_ORGANISATIONS[load.shipper].name, carrier: MOCK_ORGANISATIONS[carrier]?.name ?? carrier }),
            section(TEXT.freight, {
                equipment: LOAD_COPY.equipment[load.equipment],
                commodity: load.commodity,
                weight: grouped(load.weightLb),
                pallets: load.pallets ? `, ${load.pallets} pallets` : "",
                temperature,
                hazmat: load.hazmat ? ", hazardous materials" : "",
            }),
            section(TEXT.stops, { stops }),
            section(TEXT.pay, { pay: money(pay), miles: grouped(miles) }),
            section(TEXT.accessorials, {
                free: String(terms.detentionFreeHours),
                detention: money(terms.detentionCentsPerHour),
                layover: money(terms.layoverCentsPerDay),
                tonu: money(terms.tonuCents),
                notice: String(terms.cancellationNoticeHours),
            }),
            section(TEXT.cancellation),
            section(TEXT.acceptance),
        ],
    };
};
