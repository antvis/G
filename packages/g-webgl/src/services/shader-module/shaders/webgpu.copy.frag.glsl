layout(set = 0, binding = 0) uniform sampler u_TextureSampler;
layout(set = 0, binding = 1) uniform texture2D u_Texture;

layout(location = 0) in vec2 v_UV;
layout(location = 0) out vec4 outColor;

void main() {
  outColor = texture(sampler2D(u_Texture, u_TextureSampler), v_UV);
}