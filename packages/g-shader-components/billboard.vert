bool isPerspectiveMatrix(mat4 m) {
  return m[2][3] == -1.0;
}

vec4 billboard(vec2 offset, float rotation, bool isSizeAttenuation, mat4 pm, mat4 vm, mat4 mm, vec3 position) {
  vec4 mvPosition = vm * mm * vec4(position, 1.0);
  vec2 scale;
  scale.x = length(vec3(mm[0][0], mm[0][1], mm[0][2]));
  scale.y = length(vec3(mm[1][0], mm[1][1], mm[1][2]));

  if (isSizeAttenuation) {
    bool isPerspective = isPerspectiveMatrix(pm);
    if (isPerspective) {
      scale *= -mvPosition.z / 250.0;
    }
  }

  vec2 alignedPosition = offset * scale;
  vec2 rotatedPosition;
  rotatedPosition.x = cos(rotation) * alignedPosition.x - sin(rotation) * alignedPosition.y;
  rotatedPosition.y = sin(rotation) * alignedPosition.x + cos(rotation) * alignedPosition.y;

  mvPosition.xy += rotatedPosition;
  return pm * mvPosition;
}

#pragma glslify: export(billboard)