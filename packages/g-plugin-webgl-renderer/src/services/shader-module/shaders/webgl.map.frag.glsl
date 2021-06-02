#ifdef USE_MAP
  vec4 texelColor = texture2D(u_Map, v_Uv);
  // texelColor = mapTexelToLinear(texelColor);
  diffuseColor *= texelColor;
#endif