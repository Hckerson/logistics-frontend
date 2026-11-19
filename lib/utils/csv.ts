const QUOTED = /[",\n]/;

export const csvCell = (value: string) => (QUOTED.test(value) ? `"${value.replaceAll(`"`, `""`)}"` : value);

export const csvLine = (values: readonly string[]) => values.map(csvCell).join(",");
