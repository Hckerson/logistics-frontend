import { readFileSync, writeFileSync } from "node:fs";

const [source, from, to, target] = process.argv.slice(2);
if (!source || !from || !to || !target) {
    process.stderr.write("usage: node tools/roads/build-lane.mjs <roads.json> <lon,lat> <lon,lat> <out.json>\n");
    process.exit(1);
}

const JUNCTION = 0.06;
const SIMPLIFY = 0.012;
const PRECISION = 1000;
const EARTH_MILES = 3958.8;
const RADIANS = Math.PI / 180;

const parse = (value) => value.split(",").map(Number);
const keyOf = ([lon, lat]) => `${lon},${lat}`;
const round = (value) => Math.round(value * PRECISION) / PRECISION;

const miles = ([lon1, lat1], [lon2, lat2]) => {
    const dLat = (lat2 - lat1) * RADIANS;
    const dLon = (lon2 - lon1) * RADIANS;
    const chord = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * RADIANS) * Math.cos(lat2 * RADIANS) * Math.sin(dLon / 2) ** 2;
    return 2 * EARTH_MILES * Math.asin(Math.sqrt(chord));
};

const roads = JSON.parse(readFileSync(source, "utf8"));
const points = new Map();
const edges = new Map();

const node = (point) => {
    const key = keyOf(point);
    if (!points.has(key)) {
        points.set(key, point);
        edges.set(key, []);
    }
    return key;
};

const link = (a, b) => {
    const weight = miles(points.get(a), points.get(b));
    edges.get(a).push([b, weight]);
    edges.get(b).push([a, weight]);
};

roads.forEach((road, roadIndex) => {
    road.forEach((point, index) => {
        const key = node(point);
        points.get(key).road = roadIndex;
        if (index > 0) link(node(road[index - 1]), key);
    });
});

const cell = ([lon, lat]) => `${Math.floor(lon / JUNCTION)},${Math.floor(lat / JUNCTION)}`;
const grid = new Map();
for (const [key, point] of points) grid.set(cell(point), [...(grid.get(cell(point)) ?? []), key]);

const neighbours = ([lon, lat]) =>
    [-1, 0, 1].flatMap((dx) =>
        [-1, 0, 1].flatMap((dy) => grid.get(`${Math.floor(lon / JUNCTION) + dx},${Math.floor(lat / JUNCTION) + dy}`) ?? []),
    );

for (const [key, point] of points) {
    for (const other of neighbours(point)) {
        const candidate = points.get(other);
        if (other === key || candidate.road === point.road) continue;
        if (Math.hypot(candidate[0] - point[0], candidate[1] - point[1]) <= JUNCTION) link(key, other);
    }
}

const nearest = (target) =>
    [...points.keys()].reduce((best, key) =>
        miles(points.get(key), target) < miles(points.get(best), target) ? key : best,
    );

const start = nearest(parse(from));
const goal = nearest(parse(to));
const distance = new Map([[start, 0]]);
const previous = new Map();
const open = new Set([start]);

while (open.size > 0) {
    const current = [...open].reduce((best, key) => (distance.get(key) < distance.get(best) ? key : best));
    if (current === goal) break;
    open.delete(current);
    for (const [next, weight] of edges.get(current)) {
        const total = distance.get(current) + weight;
        if (total < (distance.get(next) ?? Infinity)) {
            distance.set(next, total);
            previous.set(next, current);
            open.add(next);
        }
    }
}

if (!previous.has(goal)) {
    process.stderr.write("no route between the two points\n");
    process.exit(1);
}

const path = [goal];
while (path[0] !== start) path.unshift(previous.get(path[0]));
const route = [parse(from), ...path.map((key) => points.get(key)), parse(to)].map(([lon, lat]) => [lon, lat]);

const offset = ([px, py], [ax, ay], [bx, by]) => {
    const dx = bx - ax;
    const dy = by - ay;
    const span = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / span));
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
};

const simplify = (line) => {
    if (line.length < 3) return line;
    let worst = 0;
    let split = 0;
    for (let index = 1; index < line.length - 1; index++) {
        const gap = offset(line[index], line[0], line[line.length - 1]);
        if (gap > worst) {
            worst = gap;
            split = index;
        }
    }
    if (worst <= SIMPLIFY) return [line[0], line[line.length - 1]];
    return [...simplify(line.slice(0, split + 1)).slice(0, -1), ...simplify(line.slice(split))];
};

const lane = simplify(route).map(([lon, lat]) => [round(lon), round(lat)]);
const length = lane.slice(1).reduce((total, point, index) => total + miles(lane[index], point), 0);
writeFileSync(target, JSON.stringify(lane));
process.stdout.write(`${lane.length} points, ${Math.round(length)} mi -> ${target}\n`);
