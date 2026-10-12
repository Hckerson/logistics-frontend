import roadData from "@/lib/data/home/roads.json";
import type { LonLat } from "@/lib/types";
import { milesApart } from "@/lib/utils/geo";

const KEY_DECIMALS = 3;
const STITCH_MILES = 1.5;
const CELLS_PER_DEGREE = 20;

interface Graph {
    points: LonLat[];
    links: [number, number][][];
}

let cached: Graph | undefined;

const cellOf = ([lon, lat]: LonLat) => `${Math.floor(lon * CELLS_PER_DEGREE)},${Math.floor(lat * CELLS_PER_DEGREE)}`;

const buildGraph = (): Graph => {
    const ids = new Map<string, number>();
    const points: LonLat[] = [];
    const links: [number, number][][] = [];
    const idOf = ([lon, lat]: readonly number[]) => {
        const key = `${lon.toFixed(KEY_DECIMALS)},${lat.toFixed(KEY_DECIMALS)}`;
        const known = ids.get(key);
        if (known !== undefined) return known;
        ids.set(key, points.length);
        points.push([lon, lat]);
        links.push([]);
        return points.length - 1;
    };
    const link = (from: number, to: number) => {
        const miles = milesApart(points[from], points[to]);
        links[from].push([to, miles]);
        links[to].push([from, miles]);
    };

    for (const line of roadData) for (let index = 1; index < line.length; index++) link(idOf(line[index - 1]), idOf(line[index]));

    const cells = new Map<string, number[]>();
    points.forEach((point, index) => cells.set(cellOf(point), [...(cells.get(cellOf(point)) ?? []), index]));
    points.forEach(([lon, lat], index) => {
        for (const dLon of [-1, 0, 1])
            for (const dLat of [-1, 0, 1])
                for (const other of cells.get(cellOf([lon + dLon / CELLS_PER_DEGREE, lat + dLat / CELLS_PER_DEGREE])) ?? [])
                    if (other > index && milesApart(points[index], points[other]) < STITCH_MILES) link(index, other);
    });

    return { points, links };
};

const nearest = ({ points }: Graph, target: LonLat) =>
    points.reduce((best, point, index) => (milesApart(point, target) < milesApart(points[best], target) ? index : best), 0);

const shortest = ({ points, links }: Graph, start: number, goal: number): number[] => {
    const distance = new Float64Array(points.length).fill(Infinity);
    const previous = new Int32Array(points.length).fill(-1);
    const queue: [number, number][] = [[0, start]];
    distance[start] = 0;

    while (queue.length > 0) {
        const [miles, node] = queue.pop() ?? [0, goal];
        if (node === goal) break;
        if (miles > distance[node]) continue;
        for (const [next, step] of links[node]) {
            if (miles + step >= distance[next]) continue;
            distance[next] = miles + step;
            previous[next] = node;
            const at = queue.findIndex(([queued]) => queued < distance[next]);
            queue.splice(at === -1 ? queue.length : at, 0, [distance[next], next]);
        }
    }

    const path = [goal];
    while (previous[path[0]] !== -1) path.unshift(previous[path[0]]);
    return path[0] === start ? path : [start, goal];
};

export const roadRoute = (from: LonLat, to: LonLat): LonLat[] => {
    const graph = (cached ??= buildGraph());
    const nodes = shortest(graph, nearest(graph, from), nearest(graph, to));
    return [from, ...nodes.map((node) => graph.points[node]), to];
};
