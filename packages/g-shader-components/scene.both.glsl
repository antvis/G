layout(std140) uniform ub_SceneParams {
  mat4 u_ProjectionMatrix;
  mat4 u_ViewMatrix;
  vec3 u_CameraPosition;
  float u_DevicePixelRatio;
  vec2 u_Viewport;
  float u_IsOrtho;
  float u_IsPicking;
};