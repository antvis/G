// @see http://www.iquilezles.org/www/articles/ellipsoids/ellipsoids.htm
float sdEllipsoidApproximated(vec2 p, vec2 r) {
  float k0 = length(p / r);
  float k1 = length(p / (r * r));
  return k0 * (k0 - 1.0) / k1;
}

#pragma glslify: export(sdEllipsoidApproximated)