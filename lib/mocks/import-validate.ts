import { fromAbsolute, toCalendarDate, today } from "@internationalized/date";
import type { ImportIssueDto, ImportRowDto } from "@/lib/contract/schemas";
import { IMPORT_FIELD_SPECS } from "@/lib/data/loads/import-fields";
import { MOCK_FACILITIES } from "@/lib/data/mocks/facilities";
import { MOCK_EQUIPMENT_WORDS, MOCK_IMPORTS, MOCK_IMPORT_ISSUES } from "@/lib/data/mocks/imports";
import { EQUIPMENT_TYPES } from "@/lib/enums/equipment-type";
import { freightStore } from "@/lib/mocks/freight-store";
import { booleanOf, dateOf, IMPORT_REQUIRED, IMPORT_RULES, squash } from "@/lib/loads/imports";
import { BOOKING_HORIZON_DAYS } from "@/lib/ui/constants";
import type { ImportField, ImportValues, MockFacility } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Context {
    facilities: readonly (readonly [string, MockFacility])[];
    existing: ReadonlyMap<string, string>;
}

type Message = keyof typeof MOCK_IMPORT_ISSUES;

const TIME = /^(\d{1,2}):(\d{2})\s*(am|pm)?$/i;
const NOON = 12;

const issue = (code: ImportIssueDto["code"], field: ImportField | null, message: Message, value = "", severity: ImportIssueDto["severity"] = "error", loadId: string | null = null): ImportIssueDto => ({
    field,
    severity,
    code,
    message: fillTemplate(MOCK_IMPORT_ISSUES[message], { field: field ? IMPORT_FIELD_SPECS[field].label : "", value }),
    loadId,
});

export const timeOf = (text: string) => {
    const match = TIME.exec(text.trim());
    if (!match) return null;
    const hours = (Number(match[1]) % NOON) + (match[3]?.toLowerCase() === "pm" ? NOON : 0);
    const clock = match[3] ? hours : Number(match[1]);
    return clock < 24 && Number(match[2]) < 60 ? `${String(clock).padStart(2, "0")}:${match[2]}` : null;
};

export const numberOf = (text: string) => {
    const value = Number(text.replace(/,/g, "").replace(/\s*lbs?$/i, ""));
    return text.trim() !== "" && Number.isFinite(value) ? value : null;
};

export const equipmentOf = (text: string) => EQUIPMENT_TYPES.find((type) => MOCK_EQUIPMENT_WORDS[type].some((word) => word === squash(text))) ?? null;

export const hazmatOf = booleanOf;

const facilityOf = (text: string, { facilities }: Context) => {
    const key = squash(text);
    return facilities.find(([id, place]) => [id, place.name, `${place.city}${place.region}`, place.city].some((name) => squash(name) === key))?.[0] ?? null;
};

const dayIn = (moment: string, timeZone: string) => toCalendarDate(fromAbsolute(Date.parse(moment), timeZone)).toString();

export const duplicateKey = (values: ImportValues) => {
    const date = dateOf(values.pickupDate.trim());
    return values.reference.trim() && date ? `${values.reference.trim().toLowerCase()}|${date.toString()}` : null;
};

export const contextFor = (organisation: string): Context => {
    const facilities = Object.entries(MOCK_FACILITIES).filter(([, place]) => place.organisation === organisation);
    const existing = new Map(
        [...freightStore().loads.values()]
            .filter((load) => load.shipper === organisation)
            .flatMap((load) => {
                const pickup = load.stops[0];
                return pickup.reference ? [[`${pickup.reference.toLowerCase()}|${dayIn(pickup.windowStart, MOCK_FACILITIES[pickup.facility].timeZone)}`, load.id] as const] : [];
            }),
    );
    return { facilities, existing };
};

const dateIssues = (values: ImportValues, timeZone: string) => {
    const pickup = dateOf(values.pickupDate.trim());
    const delivery = dateOf(values.deliveryDate.trim());
    const now = today(timeZone);
    return [
        ...(values.pickupDate.trim() && !pickup ? [issue("format", "pickupDate", "format", values.pickupDate)] : []),
        ...(values.deliveryDate.trim() && !delivery ? [issue("format", "deliveryDate", "format", values.deliveryDate)] : []),
        ...(pickup && pickup.compare(now) < 0 ? [issue("past", "pickupDate", "past", values.pickupDate)] : []),
        ...(pickup && pickup.compare(now.add({ days: BOOKING_HORIZON_DAYS })) > 0 ? [issue("horizon", "pickupDate", "horizon", values.pickupDate)] : []),
        ...(pickup && delivery && delivery.compare(pickup) < 0 ? [issue("order", "deliveryDate", "order")] : []),
        ...(pickup && pickup.compare(now) === 0 ? [issue("closeToPickup", "pickupDate", "closeToPickup", "", "warning")] : []),
        ...(["pickupTime", "deliveryTime"] as const).flatMap((field) => (values[field].trim() && !timeOf(values[field]) ? [issue("format", field, "format", values[field])] : [])),
    ];
};

const freightIssues = (values: ImportValues) => {
    const weight = numberOf(values.weightLb);
    const reefer = equipmentOf(values.equipment) === "reefer";
    const [low, high] = [numberOf(values.tempMinF), numberOf(values.tempMaxF)];
    return [
        ...(values.equipment.trim() && !equipmentOf(values.equipment) ? [issue("equipment", "equipment", "equipment", values.equipment)] : []),
        ...(values.weightLb.trim() && (weight === null || weight <= 0) ? [issue("format", "weightLb", "format", values.weightLb)] : []),
        ...(weight !== null && weight > IMPORT_RULES.weightMaxLb ? [issue("weight", "weightLb", "weight", values.weightLb)] : []),
        ...(weight !== null && weight <= IMPORT_RULES.weightMaxLb && weight > IMPORT_RULES.weightWarnLb ? [issue("weight", "weightLb", "weightNear", values.weightLb, "warning")] : []),
        ...(values.pallets.trim() && !Number.isInteger(numberOf(values.pallets)) ? [issue("format", "pallets", "format", values.pallets)] : []),
        ...(reefer && (low === null || high === null) ? [issue("temperature", "tempMinF", "temperature")] : []),
        ...(low !== null && high !== null && low > high ? [issue("temperature", "tempMaxF", "temperatureOrder")] : []),
        ...(hazmatOf(values.hazmat) === null ? [issue("format", "hazmat", "format", values.hazmat)] : []),
    ];
};

export const checkRow = (values: ImportValues, context: Context) => {
    const pickupFacilityId = facilityOf(values.pickupFacility, context);
    const deliveryFacilityId = facilityOf(values.deliveryFacility, context);
    const zone = pickupFacilityId ? MOCK_FACILITIES[pickupFacilityId].timeZone : (context.facilities.at(0)?.[1].timeZone ?? MOCK_IMPORTS.fallbackZone);
    const issues = [
        ...IMPORT_REQUIRED.flatMap((field) => (values[field].trim() ? [] : [issue("required", field, "required")])),
        ...(values.pickupFacility.trim() && !pickupFacilityId ? [issue("facility", "pickupFacility", "facility", values.pickupFacility)] : []),
        ...(values.deliveryFacility.trim() && !deliveryFacilityId ? [issue("facility", "deliveryFacility", "facility", values.deliveryFacility)] : []),
        ...dateIssues(values, zone),
        ...freightIssues(values),
    ];
    return { issues, pickupFacilityId, deliveryFacilityId };
};

const outcomeOf = (issues: readonly ImportIssueDto[]): ImportRowDto["outcome"] =>
    issues.some((found) => found.severity === "error") ? "invalid" : issues.length > 0 ? "warning" : "valid";

export const revalidate = (rows: readonly ImportRowDto[], organisation: string): ImportRowDto[] => {
    const context = contextFor(organisation);
    const seen = new Map<string, number>();
    return rows.map((row) => {
        const checked = checkRow(row.values, context);
        const key = duplicateKey(row.values);
        const first = key && !row.excluded ? seen.get(key) : undefined;
        if (key && !row.excluded && first === undefined) seen.set(key, row.line);
        const existing = key ? context.existing.get(key) : undefined;
        const issues = [
            ...checked.issues,
            ...(first === undefined ? [] : [issue("duplicateFile", "reference", "duplicateFile", String(first))]),
            ...(existing ? [issue("duplicateLoad", "reference", "duplicateLoad", existing, "error", existing)] : []),
        ];
        return { ...row, ...checked, issues, outcome: outcomeOf(issues), priceCents: null, split: null };
    });
};
