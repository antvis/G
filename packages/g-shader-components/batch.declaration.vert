layout(location = 0) attribute vec4 a_ModelMatrix0;
layout(location = 1) attribute vec4 a_ModelMatrix1;
layout(location = 2) attribute vec4 a_ModelMatrix2;
layout(location = 3) attribute vec4 a_ModelMatrix3;
layout(location = 4) attribute vec4 a_Color;
layout(location = 5) attribute vec4 a_StrokeColor;
layout(location = 6) attribute vec4 a_StylePacked1;
layout(location = 7) attribute vec4 a_StylePacked2;
layout(location = 8) attribute vec4 a_PickingColor;
layout(location = 9) attribute vec2 a_Anchor;
// layout(location = {AttributeLocation.a_Uv}) attribute vec2 a_Uv;

varying vec4 v_PickingResult;
varying vec4 v_Color;
varying vec4 v_StrokeColor;
varying vec4 v_StylePacked1;
varying vec4 v_StylePacked2;

#define COLOR_SCALE 1. / 255.
void setPickingColor(vec3 pickingColor) {
  v_PickingResult.rgb = pickingColor * COLOR_SCALE;
}