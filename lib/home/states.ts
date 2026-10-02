import { feature } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import atlas from "us-atlas/states-10m.json";
import { CONTIGUOUS_STATE_MAX, EXCLUDED_STATES } from "@/lib/home/constants";

const topology = atlas as unknown as Topology<{ states: GeometryCollection }>;
const all = feature(topology, topology.objects.states) as FeatureCollection<Geometry>;

export const CONTIGUOUS_STATES: FeatureCollection<Geometry> = {
    type: "FeatureCollection",
    features: all.features.filter((state) => {
        const id = String(state.id);
        return Number(id) <= CONTIGUOUS_STATE_MAX && !EXCLUDED_STATES.includes(id);
    }),
};
