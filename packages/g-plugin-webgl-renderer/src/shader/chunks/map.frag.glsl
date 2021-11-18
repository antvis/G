#ifdef USE_MAP
    vec4 texelColor = texture(SAMPLER_2D(u_Map), v_Uv);
    u_Color = texelColor;
#endif