import type { MockEldReading, MockTruck, MockUnavailableSpec } from "@/lib/types";

export const MOCK_TRUCKS: readonly MockTruck[] = [
    { id: "veh_101", carrier: "ridgeway", unit: "101", equipment: "dry-van", driver: "usr_driver_dee", home: "chi" },
    { id: "veh_102", carrier: "ridgeway", unit: "102", equipment: "dry-van", driver: "usr_driver_luis", home: "hou" },
    { id: "veh_103", carrier: "ridgeway", unit: "103", equipment: "flatbed", driver: "usr_driver", home: "den" },
    { id: "veh_104", carrier: "ridgeway", unit: "104", equipment: "dry-van", driver: "usr_driver_kim", home: "chi" },
    { id: "veh_105", carrier: "ridgeway", unit: "105", equipment: "reefer", driver: "usr_driver_marco", home: "lax" },
    { id: "veh_106", carrier: "ridgeway", unit: "106", equipment: "dry-van", driver: "usr_driver_noor", home: "dal" },
    { id: "veh_107", carrier: "ridgeway", unit: "107", equipment: "reefer", driver: null, home: "atl" },
];

export const MOCK_UNAVAILABLE: readonly MockUnavailableSpec[] = [
    { truck: "veh_107", startsIn: -20, endsIn: 70, reason: "maintenance", note: "Brake job at Peach State Truck Service" },
];

export const MOCK_ELD: Readonly<Record<string, MockEldReading>> = {
    usr_driver_dee: { remainingMinutes: 410, ageMinutes: 6 },
    usr_driver_luis: { remainingMinutes: 95, ageMinutes: 3 },
    usr_driver_kim: { remainingMinutes: null, ageMinutes: 140 },
    usr_driver_marco: { remainingMinutes: 600, ageMinutes: 12 },
};

export const MOCK_CARRIER_ZONES: Readonly<Record<string, string>> = {
    ridgeway: "America/Chicago",
    blueMesa: "America/Denver",
    granite: "America/Denver",
};
