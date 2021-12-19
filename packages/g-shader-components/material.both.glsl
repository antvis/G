layout(std140) uniform ub_MaterialParams {
  vec3 u_Emissive;
  float u_Shininess;
  vec3 u_Specular;
  vec3 u_AmbientLightColor;

  #ifdef USE_FOG
    vec4 u_FogInfos;
    vec3 u_FogColor;
  #endif

  #ifdef USE_LIGHT
    #if NUM_DIR_LIGHTS > 0
      DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
    #endif
  #endif

  #ifdef USE_BUMPMAP
    float u_BumpScale;
  #endif
};