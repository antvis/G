uniform sampler2D u_Texture;
in vec2 v_TexCoord;

out vec4 outputColor;

void main() {
  outputColor = texture(SAMPLER_2D(u_Texture), v_TexCoord);
}