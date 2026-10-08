import { LayerExtension, type Layer } from "@deck.gl/core";
import { TripsLayer } from "@deck.gl/geo-layers";
import type { GlowName, GlowOptions, GlowProfile, Glows, MapPalette } from "@/lib/types";
import { GLOW } from "@/lib/home/map-constants";

const HOOK = "fs:DECKGL_FILTER_COLOR";
const CHANNEL = 255;

const block = `
layout(std140) uniform glowUniforms {
    float core;
    float halo;
    float spread;
    float heat;
    float tip;
    float taper;
    vec3 hot;
} glow;

vec4 glow_shade(vec4 color, float at, float heat) {
    float glowCore = 1.0 - smoothstep(glow.core * 0.5, glow.core, at);
    color.rgb = mix(color.rgb, glow.hot, glowCore * glow.heat * heat);
    color.a *= max(glowCore, glow.halo * exp(-glow.spread * at * at));
    return color;
}
`;

const glowModule = {
    name: "glow",
    vs: block,
    fs: block,
    getUniforms: (opts?: GlowOptions) =>
        opts
            ? {
                  core: opts.core,
                  halo: opts.halo,
                  spread: opts.spread,
                  heat: opts.heat,
                  tip: opts.tip ?? 0,
                  taper: opts.taper ?? 0,
                  hot: opts.hot.map((channel) => channel / CHANNEL),
              }
            : {},
    uniformTypes: {
        core: "f32",
        halo: "f32",
        spread: "f32",
        heat: "f32",
        tip: "f32",
        taper: "f32",
        hot: "vec3<f32>",
    },
} as const;

const distance: Record<GlowProfile["shape"], string> = {
    line: "abs(geometry.uv.x)",
    dot: "length(geometry.uv)",
};

const CULL = `
if ((trips.fadeTrail && instanceNextTimestamps < trips.currentTime - trips.trailLength) || instanceTimestamps > trips.currentTime) {
    gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
    return;
}
`;

const TRAIL = `
float glowAt = abs(geometry.uv.x);
float glowAge = clamp((trips.currentTime - vTime) / trips.trailLength, 0.0, 1.0);
if (glow.taper > 0.0) glowAt /= max(pow(clamp(vTime, 0.0, 1.0), glow.taper), 0.02);
float glowHeat = 1.0;
if (glow.tip > 0.0) {
    glowHeat = (1.0 - glowAge) * (1.0 - glowAge);
    color.a *= smoothstep(0.0, glow.tip, glowAge);
}
color = glow_shade(color, glowAt, glowHeat);
`;

export class GlowExtension extends LayerExtension<GlowOptions> {
    static extensionName = "GlowExtension";

    getShaders(this: Layer, extension: GlowExtension) {
        return {
            modules: [glowModule],
            inject: { [HOOK]: `color = glow_shade(color, ${distance[extension.opts.shape]}, 1.0);` },
        };
    }

    draw(this: Layer, _params: unknown, extension: GlowExtension) {
        this.setShaderModuleProps({ glow: extension.opts });
    }
}

export class GlowTripsLayer<DataT = unknown> extends TripsLayer<DataT> {
    static layerName = "GlowTripsLayer";

    getShaders() {
        const shaders = super.getShaders();
        return {
            ...shaders,
            inject: { ...shaders.inject, "vs:#main-start": CULL, [HOOK]: `${shaders.inject[HOOK]}${TRAIL}` },
        };
    }
}

export const glowsOf = (palette: MapPalette): Glows =>
    Object.fromEntries(
        (Object.entries(GLOW) as [GlowName, GlowProfile][]).map(([name, profile]) => [
            name,
            new GlowExtension({ ...profile, hot: palette.hot }),
        ]),
    ) as Glows;
