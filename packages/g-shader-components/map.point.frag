#ifdef USE_MAP
  vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
	vec4 mapTexel = texture(SAMPLER_2D(u_Map), uv);
  u_Color *= mapTexel;
#endif