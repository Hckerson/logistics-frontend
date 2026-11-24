import type { MockEldReading, MockTruckSpec, MockUnavailableSpec, MockVehicleSpec } from "@/lib/types";

export const MOCK_TRUCKS: readonly MockTruckSpec[] = [
    { id: "veh_101", carrier: "ridgeway", unit: "101", equipment: "dry-van", vin: "1FUJGLDR7KLBK4101", plate: "P 482 931", plateState: "IL", driver: "usr_driver_dee", home: "chi" },
    { id: "veh_102", carrier: "ridgeway", unit: "102", equipment: "dry-van", vin: "3AKJHHDR5MSMR4102", plate: "R 118 204", plateState: "TX", driver: "usr_driver_luis", home: "hou" },
    { id: "veh_103", carrier: "ridgeway", unit: "103", equipment: "flatbed", vin: "1XKYD49X9LJ394103", plate: "P 557 018", plateState: "IL", driver: "usr_driver", home: "den" },
    { id: "veh_104", carrier: "ridgeway", unit: "104", equipment: "dry-van", vin: "4V4NC9EH2NN294104", plate: "P 610 377", plateState: "IL", driver: "usr_driver_kim", home: "chi" },
    { id: "veh_105", carrier: "ridgeway", unit: "105", equipment: "reefer", vin: "1M1AN4GY3NM014105", plate: "P 702 145", plateState: "IL", driver: "usr_driver_marco", home: "lax" },
    { id: "veh_106", carrier: "ridgeway", unit: "106", equipment: "dry-van", vin: "1FUJHHDR8NLMZ4106", plate: "R 309 866", plateState: "TX", driver: "usr_driver_noor", home: "dal" },
    { id: "veh_107", carrier: "ridgeway", unit: "107", equipment: "reefer", vin: "3HSDZAPR6PN714107", plate: "P 815 290", plateState: "IL", driver: null, home: "atl" },
];

export const MOCK_TRAILERS: readonly MockVehicleSpec[] = [
    { id: "trl_201", carrier: "ridgeway", unit: "T-201", equipment: "dry-van", vin: "1JJV532D8KL184201", plate: "TR 40 211", plateState: "IL" },
    { id: "trl_202", carrier: "ridgeway", unit: "T-202", equipment: "reefer", vin: "1UYVS2538LU764202", plate: "TR 40 212", plateState: "IL" },
    { id: "trl_203", carrier: "ridgeway", unit: "T-203", equipment: "flatbed", vin: "13N148202M1524203", plate: "TR 40 213", plateState: "IL" },
];

export const MOCK_ROSTER = { defaultHome: "chi", openSentDaysAgo: 1, expiredSentDaysAgo: 9 } as const;

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
