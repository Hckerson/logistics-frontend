import { DARK, layers, type Flavor } from "@protomaps/basemaps";
import type { StyleSpecification } from "maplibre-gl";
import { BASEMAP, MAP_KEY } from "@/lib/maps/constants";

export function basemapStyle(element: HTMLElement): StyleSpecification {
    const styles = getComputedStyle(element);
    const read = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback;
    const background = read("--colors-background", DARK.background);
    const land = read("--haulr-land", DARK.earth);
    const line = read("--haulr-state-line", DARK.boundaries);
    const road = read("--haulr-road", DARK.highway);
    const label = read("--colors-text-muted", DARK.city_label);

    const flavor: Flavor = {
        ...DARK,
        background,
        earth: land,
        water: background,
        park_a: land,
        park_b: land,
        wood_a: land,
        wood_b: land,
        scrub_a: land,
        scrub_b: land,
        sand: land,
        beach: land,
        glacier: land,
        buildings: line,
        boundaries: line,
        highway: road,
        major: line,
        minor_a: line,
        minor_b: line,
        city_label: label,
        city_label_halo: background,
        state_label: label,
        state_label_halo: background,
        country_label: label,
        ocean_label: label,
        roads_label_major: label,
        roads_label_major_halo: background,
        roads_label_minor: label,
        roads_label_minor_halo: background,
    };

    return {
        version: 8,
        glyphs: BASEMAP.glyphs,
        sprite: BASEMAP.sprite,
        sources: {
            [BASEMAP.source]: { type: "vector", url: `${BASEMAP.tiles}?key=${MAP_KEY}`, attribution: BASEMAP.attribution },
        },
        layers: layers(BASEMAP.source, flavor, { lang: BASEMAP.lang }),
    };
}
