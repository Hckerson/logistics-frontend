import { UI_LOCALE } from "@/lib/ui/constants";

const CENTS_PER_UNIT = 100;
const formatters = new Map<string, Intl.NumberFormat>();

const formatterOf = (currency: string) => {
    const known = formatters.get(currency);
    if (known) return known;
    const created = new Intl.NumberFormat(UI_LOCALE, { style: "currency", currency });
    formatters.set(currency, created);
    return created;
};

export const formatMoney = (cents: number, currency: string) => formatterOf(currency).format(cents / CENTS_PER_UNIT);
