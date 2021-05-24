vec2 project_to_clipspace(vec2 v) {
  return (v.xy * 2.0 - 1.) * vec2(1, -1);
}