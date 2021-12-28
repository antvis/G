#ifdef USE_FOG
  gl_FragColor.rgb = addFog(gl_FragColor.rgb);
#endif