layout(location = MODEL_MATRIX0) in vec4 a_ModelMatrix0;
layout(location = MODEL_MATRIX1) in vec4 a_ModelMatrix1;
layout(location = MODEL_MATRIX2) in vec4 a_ModelMatrix2;
layout(location = MODEL_MATRIX3) in vec4 a_ModelMatrix3;
layout(location = PACKED_COLOR) in vec4 a_PackedColor;
layout(location = PACKED_STYLE1) in vec4 a_StylePacked1;
layout(location = PACKED_STYLE2) in vec4 a_StylePacked2;
layout(location = PICKING_COLOR) in vec4 a_PickingColor;

out vec4 v_PickingResult;
out vec4 v_Color;
out vec4 v_StrokeColor;
out vec4 v_StylePacked1;
out vec4 v_StylePacked2;

#define COLOR_SCALE 1. / 255.
void setPickingColor(vec3 pickingColor) {
  v_PickingResult.rgb = pickingColor * COLOR_SCALE;
}

#pragma glslify: import('@antv/g-shader-components/compression.declaration.vert')