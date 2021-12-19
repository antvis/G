vec3 BRDF_Lambert(const in vec3 diffuseColor) {
  return RECIPROCAL_PI * diffuseColor;
}

vec3 F_Schlick(
  const in vec3 f0,
  const in float f90,
  const in float dotVH
) {
  // Original approximation by Christophe Schlick '94
  // float fresnel = pow( 1.0 - dotVH, 5.0 );

  // Optimized variant (presented by Epic at SIGGRAPH '13)
  // https://cdn2.unrealengine.com/Resources/files/2013SiggraphPresentationsNotes-26915738.pdf
  float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
  return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}

float G_BlinnPhong_Implicit( /* const in float dotNL, const in float dotNV */ ) {
  // geometry term is (n dot l)(n dot v) / 4(n dot l)(n dot v)
  return 0.25;
}

float D_BlinnPhong(
  const in float shininess,
  const in float dotNH
) {
  return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}

vec3 BRDF_BlinnPhong(
  const in vec3 lightDir,
  const in vec3 viewDir,
  const in vec3 normal,
  const in vec3 specularColor,
  const in float shininess
) {
  vec3 halfDir = normalize( lightDir + viewDir );

  float dotNH = saturate( dot( normal, halfDir ) );
  float dotVH = saturate( dot( viewDir, halfDir ) );

  vec3 F = F_Schlick( specularColor, 1.0, dotVH );

  float G = G_BlinnPhong_Implicit( /* dotNL, dotNV */ );

  float D = D_BlinnPhong( shininess, dotNH );

  return F * ( G * D );
}
