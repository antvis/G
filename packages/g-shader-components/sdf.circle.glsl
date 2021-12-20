/**
 * 2D signed distance field functions
 * @see http://www.iquilezles.org/www/articles/distfunctions2d/distfunctions2d.htm
 */

float sdCircle(vec2 p, float r) {
  return length(p) - r;
}

#pragma glslify: export(sdCircle)