layout(location = 0) in vec2 a_Position;
layout(location = 0) out vec2 v_UV;

void main() {
  v_UV = 0.5 * (a_Position + 1.0);
  gl_Position = vec4(a_Position, 0., 1.);
}