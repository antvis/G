layout(std140) uniform ub_ObjectParams {
  mat4 u_ModelMatrix;
  vec4 u_FillColor;
  vec3 u_PickingColor;
  float u_Opacity;
  float u_FillOpacity;
  float u_Visible;
  float u_ZIndex;
};