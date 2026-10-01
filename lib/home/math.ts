export const clamp = (value: number, min = 0, max = 1) =>
    Math.min(Math.max(value, min), max);

export const lerp = (from: number, to: number, amount: number) =>
    from + (to - from) * amount;

export const ramp = (value: number, start: number, end: number) =>
    clamp((value - start) / (end - start));

export const smootherstep = (value: number) => {
    const t = clamp(value);
    return t * t * t * (t * (t * 6 - 15) + 10);
};
