import type {
    ChargeDto,
    DocumentDto,
    EtaDto,
    FacilityPlaceDto,
    LoadEventDto,
    NotificationDto,
    PositionDto,
    StopDto,
} from "@/lib/contract/schemas";
import type { LoadStatus } from "./enums";
import type { Equipment } from "./quote";

export type ChargeParty = "shipper" | "carrier";

export interface MockFacility extends FacilityPlaceDto {
    organisation: string;
}

export interface MockStopSpec {
    facility: string;
    type: StopDto["type"];
    opensIn: number;
    arrived?: number;
    departed?: number;
}

export interface MockTrackSpec {
    mph: number;
    silentMinutes?: number;
    source: PositionDto["source"];
    confidence: EtaDto["confidence"];
}

export interface MockLoadSpec {
    id: string;
    status: LoadStatus;
    shipper: string;
    carrier?: string;
    driver?: string;
    equipment: Equipment;
    commodity: string;
    weightLb: number;
    pallets?: number;
    tempF?: readonly [number, number];
    hazmat?: boolean;
    poNumber?: string;
    bolNumber?: string;
    priceCents: number;
    payCents: number;
    pendingCents?: number;
    stops: readonly MockStopSpec[];
    track?: MockTrackSpec;
    ageHours: number;
}

export interface MockStop extends Omit<StopDto, "facility"> {
    facility: string;
}

export interface MockCharge extends ChargeDto {
    party: ChargeParty;
}

export interface MockLoad {
    id: string;
    status: LoadStatus;
    version: number;
    shipper: string;
    carrier: string | null;
    driver: string | null;
    equipment: Equipment;
    commodity: string;
    weightLb: number;
    pallets: number | null;
    tempMinF: number | null;
    tempMaxF: number | null;
    hazmat: boolean;
    poNumber: string | null;
    bolNumber: string | null;
    stops: MockStop[];
    charges: MockCharge[];
    track: MockTrackSpec | null;
    seededAt: number;
    createdAt: string;
    updatedAt: string;
}

export interface MockLoadEvent extends LoadEventDto {
    loadId: string;
}

export interface MockTrackingLink {
    id: string;
    token: string;
    loadId: string;
    createdByName: string;
    createdAt: string;
    revokedAt: string | null;
}

export interface MockDocument extends DocumentDto {
    loadId: string;
}

export interface MockNotification extends NotificationDto {
    userId: string;
}

export interface MockCheckCall {
    loadId: string;
    requestedAt: string;
}
