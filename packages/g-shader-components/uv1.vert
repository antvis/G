#ifdef USE_AOMAP
	v_Uv1 = ( uv2Transform * vec3( a_Uv1, 1 ) ).xy;
  #ifdef VIEWPORT_ORIGIN_TL
    v_Uv1.y = 1.0 - v_Uv1.y;
  #endif
#endif