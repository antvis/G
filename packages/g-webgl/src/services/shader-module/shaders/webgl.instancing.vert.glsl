#ifdef INSTANCING
  mat4 modelMatrix = mat4(a_ModelMatrix0, a_ModelMatrix1, a_ModelMatrix2, a_ModelMatrix3);
#else
  mat4 modelMatrix = u_ModelMatrix;
#endif