// FXAA3
// @see https://github.com/pyalot/webgl-deferred-irradiance-volumes/blob/master/src/antialias/fxaa3_11_preprocessed.shaderlib

uniform sampler2D u_Texture;
in vec2 v_TexCoord;

out vec4 outputColor;

void main() {
  outputColor = texture(SAMPLER_2D(u_Texture), v_TexCoord);
}