#ifdef INSTANCING
  mat4 model_matrix = mat4(a_model_matrix_0, a_model_matrix_1, a_model_matrix_2, a_model_matrix_3);
#else
  mat4 model_matrix = u_model_matrix;
#endif