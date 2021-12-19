float specularStrength = 1.0;

#ifdef USE_SPECULARMAP
  vec4 texelSpecular = texture(SAMPLER_2D(u_SpecularMap), v_Uv);
  specularStrength = texelSpecular.r;
#endif