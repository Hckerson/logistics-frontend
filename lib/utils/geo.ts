import type { LonLat } from "@/lib/types";

const EARTH_MILES = 3958.8;
const RADIANS = Math.PI / 180;
const FULL_TURN = 360;

export const milesApart = ([fromLon, fromLat]: LonLat, [toLon, toLat]: LonLat) => {
    const dLat = (toLat - fromLat) * RADIANS;
    const dLon = (toLon - fromLon) * RADIANS;
    const chord = Math.sin(dLat / 2) ** 2 + Math.cos(fromLat * RADIANS) * Math.cos(toLat * RADIANS) * Math.sin(dLon / 2) ** 2;
    return 2 * EARTH_MILES * Math.asin(Math.sqrt(chord));
};

export const headingFrom = ([fromLon, fromLat]: LonLat, [toLon, toLat]: LonLat) => {
    const y = Math.sin((toLon - fromLon) * RADIANS) * Math.cos(toLat * RADIANS);
    const x =
        Math.cos(fromLat * RADIANS) * Math.sin(toLat * RADIANS) -
        Math.sin(fromLat * RADIANS) * Math.cos(toLat * RADIANS) * Math.cos((toLon - fromLon) * RADIANS);
    return Math.round((Math.atan2(y, x) / RADIANS + FULL_TURN) % FULL_TURN);
};

export const cumulativeMiles = (path: readonly LonLat[]) => {
    const totals = [0];
    for (let index = 1; index < path.length; index++) totals.push(totals[index - 1] + milesApart(path[index - 1], path[index]));
    return totals;
};
