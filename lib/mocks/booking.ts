import { nanoid } from "nanoid";
import { HTTP_STATUS } from "@/lib/constants";
import type { BookingCheckDto, LoadBookedDto, LoadBookingDto } from "@/lib/contract/schemas";
import { MOCK_BOOKING, MOCK_CARGO_COVER, MOCK_INSURANCE_MINIMUMS, MOCK_TAKEN_LOADS } from "@/lib/data/mocks/booking";
import { MOCK_ORGANISATIONS } from "@/lib/data/mocks/team";
import { assignmentDeadline } from "@/lib/fleet/time";
import { CURRENCY } from "@/lib/loads/constants";
import { bookingCopy, rateConfirmationOf } from "@/lib/mocks/booking-text";
import { fleetStore } from "@/lib/mocks/fleet-store";
import { FREIGHT_MESSAGES, loadMissing, recordEvent, staleLoad, withCaller, type MockCaller } from "@/lib/mocks/freight-access";
import { freightStore } from "@/lib/mocks/freight-store";
import { fail, ok } from "@/lib/mocks/http";
import { boardCarrier, milesOf, payOf } from "@/lib/mocks/load-board";
import { placeOf } from "@/lib/mocks/load-views";
import { standingOf } from "@/lib/mocks/standing";
import type { MockLoad } from "@/lib/types";
import { bookSchema, signerMatches } from "@/lib/validations/load-board";

const holder = globalThis as typeof globalThis & { haulrBookings?: Map<string, LoadBookedDto> };
const bookings = () => (holder.haulrBookings ??= new Map());

const insuranceMin = (load: MockLoad) => MOCK_INSURANCE_MINIMUMS[load.id] ?? MOCK_BOOKING.insuranceMinCents;

const checksFor = (load: MockLoad, carrier: string): BookingCheckDto[] => {
    const blocked = standingOf(carrier).some(({ severity, capabilities }) => severity === "blocking" && capabilities.includes("book"));
    const cover = MOCK_CARGO_COVER[carrier] ?? 0;
    const fleet = [...fleetStore().trucks.values()].some((truck) => truck.carrier === carrier && truck.equipment === load.equipment);
    const posted = load.status === "Posted";
    return [
        { key: "standing", passed: !blocked, detail: bookingCopy.standing(blocked), fix: blocked ? "onboarding" : null },
        { key: "insurance", passed: cover >= insuranceMin(load), detail: bookingCopy.insurance(insuranceMin(load), cover), fix: cover >= insuranceMin(load) ? null : "documents" },
        { key: "equipment", passed: fleet, detail: bookingCopy.equipment(load.equipment, fleet), fix: fleet ? null : "fleet" },
        { key: "availability", passed: posted, detail: bookingCopy.availability(posted), fix: posted ? null : "loadBoard" },
    ];
};

const bookableLoad = (caller: MockCaller, loadId: string) => {
    const carrier = boardCarrier(caller);
    const load = freightStore().loads.get(loadId);
    return carrier && load && (load.status === "Posted" || load.carrier === carrier || MOCK_TAKEN_LOADS.has(load.id)) ? { carrier, load } : null;
};

export const viewBooking = withCaller(({ path }, { loadId }, caller) => {
    const found = bookableLoad(caller, loadId);
    if (!found) return loadMissing(path);
    const { carrier, load } = found;
    if (load.status !== "Posted") return fail(HTTP_STATUS.conflict, bookingCopy.gone, path);
    const pay = payOf(load);
    const miles = Math.max(milesOf(load), 1);
    const checks = checksFor(load, carrier);
    const view: LoadBookingDto = {
        loadId: load.id,
        version: load.version,
        status: load.status,
        shipperName: MOCK_ORGANISATIONS[load.shipper].name,
        stops: load.stops.map(({ facility, ...stop }) => ({ ...stop, facility: placeOf(facility) })),
        equipment: load.equipment,
        commodity: load.commodity,
        weightLb: load.weightLb,
        pallets: load.pallets,
        tempMinF: load.tempMinF,
        tempMaxF: load.tempMaxF,
        hazmat: load.hazmat,
        insuranceMinCents: insuranceMin(load),
        carrierPay: { totalCents: pay, currency: CURRENCY, pending: false, parts: [{ kind: "linehaul", amountCents: pay, status: "agreed" }] },
        miles,
        ratePerMileCents: Math.round(pay / miles),
        terms: { ...MOCK_BOOKING.terms },
        rateConfirmation: rateConfirmationOf(load, carrier, pay, miles),
        checks,
        bookable: checks.every(({ passed }) => passed),
    };
    return ok(HTTP_STATUS.ok, view);
});

export const bookLoad = withCaller(({ path, body }, { loadId }, caller) => {
    const found = bookableLoad(caller, loadId);
    if (!found) return loadMissing(path);
    const input = bookSchema.safeParse(body);
    if (!input.success) return fail(HTTP_STATUS.unprocessable, FREIGHT_MESSAGES.invalid, path);
    const known = bookings().get(input.data.idempotencyKey);
    if (known) return ok(HTTP_STATUS.ok, known);

    const { carrier, load } = found;
    const now = new Date().getTime();
    const at = new Date(now).toISOString();
    if (MOCK_TAKEN_LOADS.has(load.id) && load.status === "Posted") {
        Object.assign(load, { status: "Booked", carrier: MOCK_BOOKING.takenBy, version: load.version + 1, updatedAt: at, updatedBy: MOCK_ORGANISATIONS[MOCK_BOOKING.takenBy].name });
    }
    if (load.status !== "Posted") return fail(HTTP_STATUS.conflict, bookingCopy.taken, path);
    const failing = checksFor(load, carrier).find(({ passed }) => !passed);
    if (failing) return fail(HTTP_STATUS.forbidden, failing.detail, path);
    if (input.data.version !== load.version || input.data.rateConfirmationVersion !== MOCK_BOOKING.rateConfirmationVersion) return staleLoad(path, bookingCopy.changed, load);
    if (!signerMatches(input.data.signerName, caller.user.name)) return fail(HTTP_STATUS.unprocessable, bookingCopy.signer, path);

    Object.assign(load, { status: "Booked", carrier, version: load.version + 1, updatedAt: at, updatedBy: caller.user.name });
    recordEvent(load.id, caller, { type: "statusChanged", category: "status", fromStatus: "Posted", toStatus: "Booked" });
    const id = nanoid();
    const { fileName } = rateConfirmationOf(load, carrier, payOf(load), milesOf(load));
    freightStore().documents.set(id, { id, loadId: load.id, type: "rateConfirmation", fileName, contentType: "application/pdf", sizeBytes: 96_000, scanStatus: "clean", version: MOCK_BOOKING.rateConfirmationVersion, uploadedByName: caller.user.name, createdAt: at });

    const booked: LoadBookedDto = {
        loadId: load.id,
        status: load.status,
        rateConfirmationVersion: MOCK_BOOKING.rateConfirmationVersion,
        acceptedAt: at,
        assignmentDeadline: new Date(assignmentDeadline(load.stops[0].windowStart)).toISOString(),
        timeZone: placeOf(load.stops[0].facility).timeZone,
    };
    bookings().set(input.data.idempotencyKey, booked);
    return ok(HTTP_STATUS.ok, booked);
});
