import { Copy, Download, Edit, Location, Share, TrashCan, UserFollow, View } from "@carbon/icons-react";
import type { ButtonTone, ChoiceOption, ControlSize, MenuEntry, SpecimenFile, SpecimenLoad, SpecimenSignal, TabItem } from "@/lib/types";

export const SPECIMEN_TONES: readonly ButtonTone[] = ["ink", "accent", "outline", "quiet", "ghost", "danger"];

export const SPECIMEN_SIZES: readonly ControlSize[] = ["sm", "md", "lg", "xl"];

export const SPECIMEN_ICONS = { copy: Copy, download: Download, edit: Edit, share: Share } as const;

export const SPECIMEN_EQUIPMENT: readonly ChoiceOption<string>[] = [
    { value: "dry-van", label: "Dry van", detail: "53 ft, up to 45,000 lb" },
    { value: "reefer", label: "Reefer", detail: "Temperature controlled" },
    { value: "flatbed", label: "Flatbed", detail: "Tarps on request" },
    { value: "step-deck", label: "Step deck", disabledReason: "Not offered on this lane yet." },
];

export const SPECIMEN_CITIES: readonly ChoiceOption<string>[] = [
    { value: "chicago", label: "Chicago, IL", detail: "Elk Grove Village DC" },
    { value: "dallas", label: "Dallas, TX", detail: "Lancaster cross-dock" },
    { value: "atlanta", label: "Atlanta, GA", detail: "Fulton Industrial" },
    { value: "memphis", label: "Memphis, TN", detail: "Airways Blvd yard" },
    { value: "denver", label: "Denver, CO", detail: "Commerce City" },
    { value: "phoenix", label: "Phoenix, AZ", detail: "Tolleson" },
];

export const SPECIMEN_REASONS: readonly ChoiceOption<string>[] = [
    { value: "weather", label: "Weather on the lane", detail: "Road closures or chain laws" },
    { value: "receiver", label: "Receiver not ready", detail: "Dock full or appointment moved" },
    { value: "equipment", label: "Equipment issue", detail: "Breakdown or reefer alarm" },
];

export const SPECIMEN_PERIODS: readonly ChoiceOption<string>[] = [
    { value: "7d", label: "7 days" },
    { value: "30d", label: "30 days" },
    { value: "90d", label: "90 days" },
    { value: "ytd", label: "Year to date" },
];

export const SPECIMEN_MENU: readonly MenuEntry[] = [
    { id: "view", label: "View load", icon: View },
    { id: "share", label: "Share tracking link", icon: Share },
    { id: "check-call", label: "Request check call", icon: Location },
    { id: "assign", label: "Assign driver", icon: UserFollow, disabledReason: "The carrier assigns drivers once booked." },
    { id: "cancel", label: "Cancel load", icon: TrashCan, destructive: true },
];

export const SPECIMEN_TABS: readonly TabItem[] = [
    { id: "overview", label: "Overview" },
    { id: "stops", label: "Stops", count: 3 },
    { id: "documents", label: "Documents", count: 4 },
    { id: "timeline", label: "Timeline" },
    { id: "money", label: "Money", disabledReason: "Your role does not include billing." },
];

export const SPECIMEN_TAB_BODY: Readonly<Record<string, string>> = {
    overview: "Chicago, IL to Dallas, TX · 967 mi · Dry van · 42,000 lb",
    stops: "Pickup Elk Grove Village DC, then two drops in Dallas.",
    documents: "Rate confirmation, bill of lading, two delivery photos.",
    timeline: "Departed pickup 06:42 CT. Last position 12 minutes ago.",
};

export const SPECIMEN_SIGNALS: readonly SpecimenSignal[] = [
    { label: "In transit", tone: "live", pulse: true },
    { label: "Running late", tone: "warning" },
    { label: "Exception", tone: "danger" },
    { label: "Delivered", tone: "success" },
    { label: "Booked", tone: "info" },
    { label: "Posted", tone: "neutral" },
    { label: "Draft", tone: "muted" },
];

export const SPECIMEN_LOADS: readonly SpecimenLoad[] = [
    { reference: "HL-7K2M9QXA", lane: "Chicago, IL → Dallas, TX", status: "In transit", tone: "live", pickup: "Nov 3, 06:00 CT", miles: 967, rate: 2140 },
    { reference: "HL-9DQ4ZB2M", lane: "Atlanta, GA → Memphis, TN", status: "Running late", tone: "warning", pickup: "Nov 3, 08:30 ET", miles: 392, rate: 1180 },
    { reference: "HL-3RW8TNPE", lane: "Denver, CO → Phoenix, AZ", status: "Exception", tone: "danger", pickup: "Nov 2, 14:00 MT", miles: 822, rate: 2475 },
    { reference: "HL-4MC9RD7K", lane: "Dallas, TX → Atlanta, GA", status: "Booked", tone: "info", pickup: "Nov 4, 07:00 CT", miles: 781, rate: 1890 },
    { reference: "HL-2GL4YN7S", lane: "Memphis, TN → Chicago, IL", status: "Delivered", tone: "success", pickup: "Nov 1, 10:00 CT", miles: 531, rate: 1320 },
    { reference: "HL-5RT8VK3M", lane: "Phoenix, AZ → Denver, CO", status: "Posted", tone: "neutral", pickup: "Nov 5, 09:00 MT", miles: 822, rate: 2210 },
];

export const SPECIMEN_GLOSSARY = {
    term: "TONU",
    definition: "Truck ordered, not used: a fee owed to the carrier when a booked load is cancelled after the truck is dispatched.",
} as const;

export const SPECIMEN_TOTAL = 1240;

export const SPECIMEN_HOLD_MINUTES = 12;

export const SPECIMEN_PENDING_MS = 2400;

export const SPECIMEN_SHORTCUT = ["⌘", "K"] as const;

export const SPECIMEN_TIME_ZONE = "America/Chicago";

export const SPECIMEN_FILES: readonly SpecimenFile[] = [
    { name: "rate-confirmation-HL-7K2M9QXA.pdf", sizeBytes: 182_000, state: "uploaded" },
    { name: "bill-of-lading-HL-7K2M9QXA.pdf", sizeBytes: 2_400_000, state: "uploading", progress: 0.4 },
    { name: "delivery-photo-dock-4.jpg", sizeBytes: 3_100_000, state: "scanning" },
    { name: "lumper-receipt.heic", sizeBytes: 900_000, state: "rejected", message: "lumper-receipt.heic is not a PDF, JPG or PNG." },
];
