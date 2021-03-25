uniform vec2 u_Viewport;

vec2 project_to_clipspace(vec2 v) {
  return (v.xy / u_Viewport * 2.0 - 1.) * vec2(1, -1);
}