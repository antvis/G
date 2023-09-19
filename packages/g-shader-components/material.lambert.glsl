layout(std140) uniform ub_MaterialParams {
  #ifdef USE_WIREFRAME
    vec3 u_WireframeLineColor;
    float u_WireframeLineWidth;
  #endif

  #ifdef USE_FOG
    vec4 u_FogInfos;
    vec3 u_FogColor;
  #endif

  vec3 u_Emissive;

  #ifdef USE_LIGHT
    #ifdef USE_BUMPMAP
      float u_BumpScale;
    #endif

    #ifdef NUM_AMBIENT_LIGHTS
      vec3 u_AmbientLightColor;
    #endif

    #ifdef NUM_DIR_LIGHTS
      DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
    #endif
  #endif
};