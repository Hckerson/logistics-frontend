import { parseDateTime, toZoned, today } from "@internationalized/date";
import { customAlphabet } from "nanoid";
import { TIME_MS } from "@/lib/constants";
import type { ImportIssueDto, ImportRowDto } from "@/lib/contract/schemas";
import { MOCK_FACILITIES } from "@/lib/data/mocks/facilities";
import { MOCK_IMPORTS, MOCK_IMPORT_ISSUES, MOCK_SPEND_LIMITS } from "@/lib/data/mocks/imports";
import { MOCK_PRICING } from "@/lib/data/mocks/pricing";
import { dateOf, IMPORT_RULES } from "@/lib/loads/imports";
import { recordEvent, type MockCaller } from "@/lib/mocks/freight-access";
import { freightStore } from "@/lib/mocks/freight-store";
import { iso } from "@/lib/mocks/import-store";
import { equipmentOf, hazmatOf, numberOf, timeOf } from "@/lib/mocks/import-validate";
import type { ImportSplit, LoadStatus, MockImport, MockLoad, MockStop } from "@/lib/types";
import { csvLine } from "@/lib/utils/csv";
import { fillTemplate } from "@/lib/utils/fill-template";
import { milesApart } from "@/lib/utils/geo";

const CENTS = 100;
const nextLoadId = customAlphabet(MOCK_IMPORTS.loadIdAlphabet, MOCK_IMPORTS.loadIdLength);
const STATUS_OF = { postNow: "Posted", needsApproval: "PendingApproval", draft: "Draft" } as const satisfies Record<ImportSplit, LoadStatus>;

const roadMiles = (from: string, to: string) => {
    const [start, end] = [MOCK_FACILITIES[from], MOCK_FACILITIES[to]];
    return milesApart([start.longitude, start.latitude], [end.longitude, end.latitude]) * MOCK_PRICING.roadFactor;
};

const priceOf = ({ values, pickupFacilityId, deliveryFacilityId }: ImportRowDto) => {
    const equipment = equipmentOf(values.equipment);
    if (!equipment || !pickupFacilityId || !deliveryFacilityId) return null;
    const miles = roadMiles(pickupFacilityId, deliveryFacilityId);
    if (miles > IMPORT_RULES.unpricedMiles) return null;
    return Math.round((MOCK_PRICING.perMile[equipment] * miles) / MOCK_PRICING.roundTo) * MOCK_PRICING.roundTo * CENTS;
};

const unpriced = (down: boolean): ImportIssueDto => ({ field: null, severity: "warning", code: "unpriced", message: MOCK_IMPORT_ISSUES[down ? "unavailable" : "unpriced"], loadId: null });

export const priceRows = (batch: MockImport, caller: MockCaller, now: number) => {
    const limit = MOCK_SPEND_LIMITS[caller.user.email] ?? null;
    const down = batch.fileName.toLowerCase().includes(MOCK_IMPORTS.pricingDown);
    batch.rows = batch.rows.map((row) => {
        const issues = row.issues.filter((found) => found.code !== "unpriced");
        if (row.excluded || row.outcome === "invalid") return { ...row, issues, priceCents: null, split: null };
        const priceCents = down ? null : priceOf(row);
        const split: ImportSplit = priceCents === null ? "draft" : limit !== null && priceCents > limit ? "needsApproval" : "postNow";
        return { ...row, priceCents, split, issues: priceCents === null ? [...issues, unpriced(down)] : issues };
    });
    const count = (split: ImportSplit) => batch.rows.filter((row) => row.split === split).length;
    batch.pricing = {
        postNow: count("postNow"),
        needsApproval: count("needsApproval"),
        draft: count("draft"),
        totalCents: batch.rows.reduce((sum, row) => sum + (row.priceCents ?? 0), 0),
        quoteExpiresAt: iso(now + IMPORT_RULES.quoteMinutes * TIME_MS.minute),
        spendLimitCents: limit,
        unavailable: down,
    };
};

const windowOf = (date: string, time: string, facility: string) => {
    const { timeZone } = MOCK_FACILITIES[facility];
    const day = dateOf(date.trim()) ?? today(timeZone);
    const start = toZoned(parseDateTime(`${day.toString()}T${timeOf(time) ?? MOCK_IMPORTS.defaultTime}`), timeZone).toDate().getTime();
    return { windowStart: iso(start), windowEnd: iso(start + MOCK_IMPORTS.windowHours * TIME_MS.hour) };
};

const optional = (text: string) => text.trim() || null;

const stopOf = (loadId: string, type: MockStop["type"], facility: string, date: string, time: string, reference: string | null, instructions: string | null): MockStop => {
    const sequence = type === "pickup" ? 1 : 2;
    return { id: `${loadId}-${sequence}`, sequence, type, facility, ...windowOf(date, time, facility), reference, instructions, arrivedAt: null, departedAt: null };
};

const loadOf = (row: ImportRowDto, batch: MockImport, status: LoadStatus, [pickup, delivery]: readonly [string, string], now: number): MockLoad => {
    const id = `HL-${nextLoadId()}`;
    const { values } = row;
    return {
        id,
        status,
        heldFrom: null,
        version: 1,
        shipper: batch.organisation,
        carrier: null,
        driver: null,
        equipment: equipmentOf(values.equipment) ?? "dry-van",
        commodity: values.commodity.trim(),
        weightLb: numberOf(values.weightLb) ?? 0,
        pallets: numberOf(values.pallets),
        tempMinF: numberOf(values.tempMinF),
        tempMaxF: numberOf(values.tempMaxF),
        hazmat: hazmatOf(values.hazmat) ?? false,
        poNumber: optional(values.poNumber),
        bolNumber: null,
        stops: [
            stopOf(id, "pickup", pickup, values.pickupDate, values.pickupTime, values.reference.trim(), optional(values.instructions)),
            stopOf(id, "delivery", delivery, values.deliveryDate, values.deliveryTime, null, null),
        ],
        charges: row.priceCents === null ? [] : [{ party: "shipper", kind: "linehaul", amountCents: row.priceCents, status: "agreed" }],
        track: null,
        seededAt: now,
        importBatchId: batch.id,
        createdAt: iso(now),
        updatedAt: iso(now),
    };
};

export const confirmRows = (batch: MockImport, caller: MockCaller, now: number) => {
    const store = freightStore();
    batch.rows = batch.rows.map((row) => {
        if (!row.split || !row.pickupFacilityId || !row.deliveryFacilityId) return row;
        const load = loadOf(row, batch, STATUS_OF[row.split], [row.pickupFacilityId, row.deliveryFacilityId], now);
        store.loads.set(load.id, load);
        recordEvent(load.id, caller, { type: "statusChanged", category: "status", toStatus: load.status, note: fillTemplate(MOCK_IMPORTS.eventNote, { file: batch.fileName }) });
        return { ...row, loadId: load.id };
    });
    const made = (status: LoadStatus) => batch.rows.filter((row) => row.loadId && row.split && STATUS_OF[row.split] === status).length;
    batch.outcome = { posted: made("Posted"), pendingApproval: made("PendingApproval"), draft: made("Draft"), rejected: batch.rows.filter((row) => !row.loadId).length };
};

const outcomeLabel = (row: ImportRowDto) => {
    if (row.excluded) return MOCK_IMPORTS.resultOutcomes.excluded;
    return row.loadId && row.split ? MOCK_IMPORTS.resultOutcomes[STATUS_OF[row.split]] : MOCK_IMPORTS.resultOutcomes.rejected;
};

export const resultsCsv = (batch: MockImport) =>
    [
        csvLine(MOCK_IMPORTS.resultColumns),
        ...batch.rows.map((row) =>
            csvLine([
                String(row.line),
                row.values.reference,
                outcomeLabel(row),
                row.loadId ?? "",
                row.priceCents === null ? "" : (row.priceCents / CENTS).toFixed(2),
                row.issues.map((found) => found.message).join(" "),
            ]),
        ),
    ].join("\n");
