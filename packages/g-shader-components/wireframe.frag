#ifdef USE_WIREFRAME
  vec3 color = mix(outputColor.xyz, u_WireframeLineColor, (1.0 - edgeFactor()));
  outputColor.xyz = color;
#endif