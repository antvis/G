#ifdef USE_WIREFRAME
  vec3 color = mix(gl_FragColor.xyz, u_WireframeLineColor, (1.0 - edgeFactor()));
  gl_FragColor.xyz = color;
#endif