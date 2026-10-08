import { feature, mesh } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import atlas from "us-atlas/states-10m.json";
import type { LonLat } from "@/lib/types";
import { CONTIGUOUS_STATE_MAX, EXCLUDED_STATES } from "@/lib/home/map-constants";

const topology = atlas as unknown as Topology<{ states: GeometryCollection }>;

const contiguous = (id: unknown) => Number(id) <= CONTIGUOUS_STATE_MAX && !EXCLUDED_STATES.includes(String(id));

const states: GeometryCollection = {
    ...topology.objects.states,
    geometries: topology.objects.states.geometries.filter((state) => contiguous(state.id)),
};

export const CONTIGUOUS_STATES = feature(topology, states) as FeatureCollection<Geometry>;

export const STATE_BORDERS = mesh(topology, states).coordinates as LonLat[][];
