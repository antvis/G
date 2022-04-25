#ifdef USE_MAP
  #ifdef USE_PATTERN
    vec4 texelColor = texture(SAMPLER_2D(u_Map), v_Uv);
    u_Color = texelColor;
  #else
    vec4 texelColor = texture(SAMPLER_2D(u_Map), v_Uv);
    u_Color = texelColor;
  #endif
#endif