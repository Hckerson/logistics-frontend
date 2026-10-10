const rules = new Intl.PluralRules("en");

export const pluralize = (count: number, forms: { one: string; other: string }) =>
    (rules.select(count) === "one" ? forms.one : forms.other).replace("{count}", String(count));
