#ifdef USE_WIREFRAME
  varying vec3 v_Barycentric;

  float edgeFactor() {
    float u_WireframeLineWidth = 1.0;
    vec3 d = fwidth(v_Barycentric);
    vec3 a3 = smoothstep(vec3(0.0), d * u_WireframeLineWidth, v_Barycentric);
    return min(min(a3.x, a3.y), a3.z);
  }
#endif
