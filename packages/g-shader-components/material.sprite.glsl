layout(std140)uniform ub_MaterialParams{
  
  #ifdef USE_FOG
  vec4 u_FogInfos;
  vec3 u_FogColor;
  #endif
  
  vec4 u_Placeholder;
  // float u_PointSize;
};