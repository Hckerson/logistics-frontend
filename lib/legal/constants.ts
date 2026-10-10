export const LEGAL_DOCUMENTS = ["terms", "privacy", "shipper-terms", "carrier-agreement"] as const;

export const LEGAL_LOCALE = "en-US";

export const LEGAL_DATE: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" };

export const SECTION_SPY = { rootMargin: "-20% 0px -70% 0px" } as const;

export const PROVIDERS_CLAUSE = "sharing";

export const VERSION_CELL_REM = 2.25;
