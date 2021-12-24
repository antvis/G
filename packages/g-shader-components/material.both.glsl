layout(std140) uniform ub_MaterialParams {
  vec4 u_Placeholder;

  #ifdef USE_FOG
    vec4 u_FogInfos;
    vec3 u_FogColor;
  #endif

  #ifdef USE_LIGHT
    vec3 u_Emissive;
    float u_Shininess;
    vec3 u_Specular;
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