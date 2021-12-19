struct BlinnPhongMaterial {
  vec3 diffuseColor;
  vec3 specularColor;
  float specularShininess;
  float specularStrength;
};

void RE_Direct_BlinnPhong(
  const in IncidentLight directLight,
  const in GeometricContext geometry,
  const in BlinnPhongMaterial material,
  inout ReflectedLight reflectedLight
) {
  float dotNL = saturate(dot(geometry.normal, directLight.direction));
  vec3 irradiance = dotNL * directLight.color;

  reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );

  reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometry.viewDir, geometry.normal, material.specularColor, material.specularShininess ) * material.specularStrength;
}

void RE_IndirectDiffuse_BlinnPhong(
  const in vec3 irradiance,
  const in GeometricContext geometry,
  const in BlinnPhongMaterial material,
  inout ReflectedLight reflectedLight
) {
  reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}

vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}

#define RE_Direct           RE_Direct_BlinnPhong
#define RE_IndirectDiffuse  RE_IndirectDiffuse_BlinnPhong