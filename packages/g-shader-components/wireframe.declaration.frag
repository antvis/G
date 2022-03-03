#ifdef USE_WIREFRAME
  in vec3 v_Barycentric;

  float edgeFactor() {
    vec3 d = fwidth(v_Barycentric);
    vec3 a3 = smoothstep(vec3(0.0), d * u_WireframeLineWidth, v_Barycentric);
    return min(min(a3.x, a3.y), a3.z);
  }
#endif
