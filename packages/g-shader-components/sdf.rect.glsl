// @see https://www.shadertoy.com/view/4llXD7
float sdRoundedBox(vec2 p, vec2 b, float r) {
  p = abs(p) - b + r;
  return length(max(p, 0.0)) + min(max(p.x, p.y), 0.0) - r;
}

#pragma glslify: export(sdRoundedBox)