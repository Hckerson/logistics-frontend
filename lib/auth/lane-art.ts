import "server-only";
import type { LonLat } from "@/lib/types";
import roadData from "@/lib/data/home/roads.json";
import { HUBS } from "@/lib/data/home/hubs";
import { LANE_PATH, LANE_TIMES } from "@/lib/home/lane";

type Point = [number, number];

const RADIANS = Math.PI / 180;
const WIDTH = 480;
const PAD = 36;
const MARGIN = { lon: 2.4, lat: 1.6 };
const STOPS = ["CHI", "MEM", "DAL"];

const lons = LANE_PATH.map(([lon]) => lon);
const lats = LANE_PATH.map(([, lat]) => lat);
const bounds = {
    west: Math.min(...lons) - MARGIN.lon,
    east: Math.max(...lons) + MARGIN.lon,
    south: Math.min(...lats) - MARGIN.lat,
    north: Math.max(...lats) + MARGIN.lat,
};
const squash = Math.cos(((bounds.north + bounds.south) / 2) * RADIANS);
const scale = (WIDTH - PAD * 2) / ((bounds.east - bounds.west) * squash);

const project = ([lon, lat]: LonLat): Point => [
    PAD + (lon - bounds.west) * squash * scale,
    PAD + (bounds.north - lat) * scale,
];

const inside = ([lon, lat]: LonLat) =>
    lon >= bounds.west && lon <= bounds.east && lat >= bounds.south && lat <= bounds.north;

const pathOf = (points: Point[]) =>
    points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

const runs = (road: LonLat[]) =>
    road.reduce<LonLat[][]>((all, point) => {
        if (!inside(point)) return [...all, []];
        all[all.length - 1].push(point);
        return all;
    }, [[]]);

const ROUTE = LANE_PATH.map(project);

export const LANE_ART = {
    width: WIDTH,
    height: PAD * 2 + (bounds.north - bounds.south) * scale,
    route: pathOf(ROUTE),
    points: ROUTE,
    times: LANE_TIMES,
    roads: (roadData as LonLat[][])
        .flatMap(runs)
        .filter((run) => run.length > 1)
        .map((run) => pathOf(run.map(project)))
        .join(" "),
    stops: HUBS.filter((hub) => STOPS.includes(hub.code)).map((hub) => ({
        code: hub.code,
        at: project([hub.lon, hub.lat]),
    })),
};
