#ifdef USE_LIGHT
  void getDirectionalLightInfo(
    const in DirectionalLight directionalLight, 
    const in GeometricContext geometry,
    out IncidentLight light
  ) {
    light.color = directionalLight.color * directionalLight.intensity;
    light.direction = normalize(directionalLight.direction);
    light.visible = true;
  }

  vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
    vec3 irradiance = ambientLightColor;
    return irradiance;
  }
#endif