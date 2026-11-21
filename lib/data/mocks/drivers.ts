import type { DriverContactDto } from "@/lib/contract/schemas";
import type { MockUser } from "@/lib/types";

export const MOCK_DISPATCH_CONTACTS: Readonly<Record<string, DriverContactDto>> = {
    ridgeway: { name: "Ray Okoro", phone: "+1 312 555 0142" },
    blueMesa: { name: "Rosa Diaz", phone: "+1 505 555 0187" },
    granite: { name: "Ben Hale", phone: "+1 801 555 0119" },
};

export const MOCK_FACILITY_CONTACTS: Readonly<Record<string, DriverContactDto>> = {
    chi: { name: "Shipping desk", phone: "+1 773 555 0101" },
    dal: { name: "Receiving", phone: "+1 214 555 0102" },
    den: { name: "Yard office", phone: "+1 303 555 0103" },
    slc: { name: "Receiving", phone: "+1 801 555 0104" },
    hou: { name: "Dock 4", phone: "+1 713 555 0105" },
    nol: { name: "Receiving", phone: "+1 504 555 0106" },
    ind: { name: "Receiving", phone: "+1 317 555 0107" },
    det: { name: "Shipping desk", phone: "+1 313 555 0108" },
    atl: { name: "Receiving", phone: "+1 404 555 0109" },
};

export const MOCK_POD = { verifySeconds: 8, uploadHost: "/api/mock-storage" } as const;

export const MOCK_DRIVER_USERS: readonly MockUser[] = [
    {
        id: "usr_driver_luis",
        name: "Luis Ortega",
        email: "driver2@ridgeway.example",
        password: "hunter22",
        role: "USER",
        roles: ["carrier.driver"],
        verified: true,
        mfa: false,
    },
    {
        id: "usr_driver_kim",
        name: "Kim Tran",
        email: "driver3@ridgeway.example",
        password: "hunter22",
        role: "USER",
        roles: ["carrier.driver"],
        verified: true,
        mfa: false,
    },
    {
        id: "usr_driver_noor",
        name: "Noor Haddad",
        email: "driver4@ridgeway.example",
        password: "hunter22",
        role: "USER",
        roles: ["carrier.driver"],
        verified: true,
        mfa: false,
    },
    {
        id: "usr_driver_dee",
        name: "Dee Walker",
        email: "driver5@ridgeway.example",
        password: "hunter22",
        role: "USER",
        roles: ["carrier.driver"],
        verified: true,
        mfa: false,
    },
    {
        id: "usr_driver_marco",
        name: "Marco Bell",
        email: "driver6@ridgeway.example",
        password: "hunter22",
        role: "USER",
        roles: ["carrier.driver"],
        verified: true,
        mfa: false,
    },
];
