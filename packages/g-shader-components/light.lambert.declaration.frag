struct LambertMaterial {
  vec3 diffuseColor;
  float specularStrength;
};

void RE_Direct_Lambert(
  IncidentLight directLight,
  GeometricContext geometry,
  LambertMaterial material,
  inout ReflectedLight reflectedLight
) {
  float dotNL = saturate(dot(geometry.normal, directLight.direction));
  vec3 irradiance = dotNL * directLight.color;

  reflectedLight.directDiffuse += irradiance * BRDF_Lambert(material.diffuseColor);
}

void RE_IndirectDiffuse_Lambert(
  vec3 irradiance,
  GeometricContext geometry,
  LambertMaterial material,
  inout ReflectedLight reflectedLight
) {
  reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert(material.diffuseColor);
}

#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert