/**
 * 2D signed distance field functions
 * @see http://www.iquilezles.org/www/articles/distfunctions2d/distfunctions2d.htm
 */

float ndot(vec2 a, vec2 b ) { return a.x*b.x - a.y*b.y; }

float sdCircle(vec2 p, float r) {
  return length(p) - r;
}

// @see http://www.iquilezles.org/www/articles/ellipsoids/ellipsoids.htm
float sdEllipsoidApproximated(vec2 p, vec2 r) {
  float k0 = length(p/r);
  float k1 = length(p/(r*r));
  return k0*(k0-1.0)/k1;
}

float sdBox(vec2 p, vec2 b) {
  vec2 d = abs(p)-b;
  return length(max(d,vec2(0))) + min(max(d.x,d.y),0.0);
}

float sdRoundedBox(vec2 p, vec2 b, float r) {
  return sdBox(p, b) - r;
}