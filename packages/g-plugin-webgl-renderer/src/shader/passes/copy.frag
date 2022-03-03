uniform sampler2D u_Texture;
in vec2 v_TexCoord;

layout(location = 0) out vec4 gbuf_color;

void main() {
  gbuf_color = texture(SAMPLER_2D(u_Texture), v_TexCoord);
}