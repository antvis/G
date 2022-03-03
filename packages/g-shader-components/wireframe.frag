#ifdef USE_WIREFRAME
  vec3 color = mix(gbuf_color.xyz, u_WireframeLineColor, (1.0 - edgeFactor()));
  gbuf_color.xyz = color;
#endif