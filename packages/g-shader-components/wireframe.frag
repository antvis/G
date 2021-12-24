#ifdef USE_WIREFRAME
  vec3 u_WireframeLineColor = vec3(0.);
  vec3 color = mix(gl_FragColor.xyz, u_WireframeLineColor, (1.0 - edgeFactor()));
  gl_FragColor.xyz = color;
#endif