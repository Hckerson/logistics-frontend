import type { DriverPositionDto } from "@/lib/contract/schemas";

const holder = globalThis as typeof globalThis & { haulrPositionReports?: Map<string, DriverPositionDto[]> };

export const positionReports = () => (holder.haulrPositionReports ??= new Map<string, DriverPositionDto[]>());

export const reportedPositions = (loadId: string): readonly DriverPositionDto[] => positionReports().get(loadId) ?? [];
