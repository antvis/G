#ifdef USE_FOG
  #define FOGMODE_NONE 0.
  #define FOGMODE_EXP 1.
  #define FOGMODE_EXP2 2.
  #define FOGMODE_LINEAR 3.

  // in float v_FogDepth;

  float dBlendModeFogFactor = 1.0;

  vec3 addFog(vec3 color) {
    float depth = gl_FragCoord.z / gl_FragCoord.w;
    // float depth = v_FogDepth;
    float fogFactor;
    float fogStart = u_FogInfos.y;
    float fogEnd = u_FogInfos.z;
    float fogDensity = u_FogInfos.w;

    if (u_FogInfos.x == FOGMODE_NONE) {
      fogFactor = 1.0;
    } else if (u_FogInfos.x == FOGMODE_EXP) {
      fogFactor = exp(-depth * fogDensity);
    } else if (u_FogInfos.x == FOGMODE_EXP2) {
      fogFactor = exp(-depth * depth * fogDensity * fogDensity);
    } else if (u_FogInfos.x == FOGMODE_LINEAR) {
      fogFactor = (fogEnd - depth) / (fogEnd - fogStart);
    }

    fogFactor = clamp(fogFactor, 0.0, 1.0);
    return mix(u_FogColor * dBlendModeFogFactor, color, fogFactor);
  }
#endif
