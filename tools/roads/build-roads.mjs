import { readFileSync, writeFileSync } from "node:fs";

const [source, target] = process.argv.slice(2);
if (!source || !target) {
    process.stderr.write("usage: node tools/roads/build-roads.mjs <ne_10m_roads.geojson> <out.json>\n");
    process.exit(1);
}

const BOUNDS = { west: -125, east: -66, south: 24, north: 50 };
const JOIN_TOLERANCE = 0.02;
const MIN_POINTS = 2;
const PRECISION = 1000;

const round = (value) => Math.round(value * PRECISION) / PRECISION;
const inside = ([lon, lat]) =>
    lon >= BOUNDS.west && lon <= BOUNDS.east && lat >= BOUNDS.south && lat <= BOUNDS.north;
const near = (a, b) => Math.abs(a[0] - b[0]) < JOIN_TOLERANCE && Math.abs(a[1] - b[1]) < JOIN_TOLERANCE;

const lines = (feature) =>
    feature.geometry.type === "LineString" ? [feature.geometry.coordinates] : feature.geometry.coordinates;

const chain = (segments) => {
    const pool = segments.map((segment) => [...segment]);
    const chains = [];
    while (pool.length > 0) {
        let current = pool.pop();
        let grew = true;
        while (grew) {
            grew = false;
            for (let index = 0; index < pool.length; index++) {
                const next = pool[index];
                const head = current[0];
                const tail = current[current.length - 1];
                if (near(tail, next[0])) current = [...current, ...next.slice(1)];
                else if (near(tail, next[next.length - 1])) current = [...current, ...next.reverse().slice(1)];
                else if (near(head, next[next.length - 1])) current = [...next, ...current.slice(1)];
                else if (near(head, next[0])) current = [...next.reverse(), ...current.slice(1)];
                else continue;
                pool.splice(index, 1);
                grew = true;
                break;
            }
        }
        chains.push(current);
    }
    return chains;
};

const collection = JSON.parse(readFileSync(source, "utf8"));
const byName = new Map();

for (const feature of collection.features) {
    const { sov_a3: country, level, name } = feature.properties;
    if (country !== "USA" || level !== "Interstate") continue;
    for (const line of lines(feature)) {
        const kept = line.filter(inside).map(([lon, lat]) => [round(lon), round(lat)]);
        if (kept.length < MIN_POINTS) continue;
        const key = name ?? "unnamed";
        byName.set(key, [...(byName.get(key) ?? []), kept]);
    }
}

const roads = [...byName.values()].flatMap(chain).sort((a, b) => b.length - a.length);
writeFileSync(target, JSON.stringify(roads));
process.stdout.write(
    `${roads.length} roads, ${roads.reduce((total, road) => total + road.length, 0)} points -> ${target}\n`,
);
