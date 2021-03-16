#ifdef INSTANCING
  attribute vec4 a_model_matrix_0;
  attribute vec4 a_model_matrix_1;
  attribute vec4 a_model_matrix_2;
  attribute vec4 a_model_matrix_3;
#else
  uniform mat4 u_model_matrix;
#endif