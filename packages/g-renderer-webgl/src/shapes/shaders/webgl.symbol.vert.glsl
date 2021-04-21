attribute vec2 a_pos;
attribute vec2 a_tex;
attribute vec2 a_offset;

uniform vec2 u_sdf_map_size;
uniform mat4 u_label_matrix;
uniform mat4 u_gl_matrix;
uniform float u_font_size;

varying vec2 v_uv;
varying float v_gamma_scale;

void main() {
    v_uv = a_tex / u_sdf_map_size;

    float fontScale = u_font_size / 24.;

    vec4 projected_pos = u_label_matrix * vec4(a_pos, 0.0, 1.0);
    gl_Position = u_gl_matrix * vec4(projected_pos.xy / projected_pos.w + a_offset * fontScale, 0.0, 1.0);

    v_gamma_scale = gl_Position.w;
}