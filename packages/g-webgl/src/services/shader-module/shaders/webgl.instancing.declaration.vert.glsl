#ifdef INSTANCING
  attribute vec4 a_ModelMatrix0;
  attribute vec4 a_ModelMatrix1;
  attribute vec4 a_ModelMatrix2;
  attribute vec4 a_ModelMatrix3;
#else
  uniform mat4 u_ModelMatrix;
#endif