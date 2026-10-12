export const fillTemplate = (text: string, values: Readonly<Record<string, string>>) =>
    text.replace(/\{(\w+)\}/g, (placeholder, key: string) => values[key] ?? placeholder);
