#define SDF_PX 8.0
#define DEVICE_PIXEL_RATIO 2.0
#define EDGE_GAMMA 0.105 / DEVICE_PIXEL_RATIO

uniform sampler2D u_sdf_map;
uniform float u_gamma_scale;
uniform vec4 u_font_color;
uniform float u_font_size;
uniform float u_font_opacity;
uniform vec4 u_halo_color;
uniform float u_halo_width;
uniform float u_halo_blur;
uniform bool u_debug;

varying vec2 v_uv;
varying float v_gamma_scale;

void main() {
    // get sdf from atlas
    float dist = texture2D(u_sdf_map, v_uv).a;

    float fontScale = u_font_size / 24.0;
    // lowp float buff = (256.0 - 64.0) / 256.0;
    // highp float gamma = EDGE_GAMMA / (fontScale * u_gamma_scale);

    lowp float buff = (6.0 - u_halo_width / fontScale) / SDF_PX;
    highp float gamma = (u_halo_blur * 1.19 / SDF_PX + EDGE_GAMMA) / (fontScale * u_gamma_scale);
    
    highp float gamma_scaled = gamma * v_gamma_scale;

    highp float alpha = smoothstep(buff - gamma_scaled, buff + gamma_scaled, dist);

    gl_FragColor = mix(u_font_color * u_font_opacity, u_halo_color, smoothstep(0., .5, 1. - dist)) * alpha;

    if (u_debug) {
        vec4 debug_color = vec4(1., 0., 0., 1.);
        gl_FragColor = mix(gl_FragColor, debug_color, 0.5);
    }
}