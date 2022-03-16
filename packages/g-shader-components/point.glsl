layout(std140) uniform ub_MaterialParams {
  #ifdef USE_WIREFRAME
    vec3 u_WireframeLineColor;
    float u_WireframeLineWidth;
  #endif

  #ifdef USE_FOG
    vec4 u_FogInfos;
    vec3 u_FogColor;
  #endif

  float u_Size;
  vec4 u_Placeholder;
};