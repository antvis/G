mat4 u_ModelMatrix = mat4(a_ModelMatrix0, a_ModelMatrix1, a_ModelMatrix2, a_ModelMatrix3);
vec4 u_StrokeColor = a_StrokeColor;
float u_Opacity = a_StylePacked1.x;
float u_FillOpacity = a_StylePacked1.y;
float u_StrokeOpacity = a_StylePacked1.z;
float u_StrokeWidth = a_StylePacked1.w;
float u_ZIndex = a_PickingColor.w;
vec2 u_Anchor = a_StylePacked2.yz;
float u_IncreasedLineWidthForHitTesting = a_StylePacked2.w;

setPickingColor(a_PickingColor.xyz);

v_Color = a_Color;
v_StrokeColor = a_StrokeColor;
v_StylePacked1 = a_StylePacked1;
v_StylePacked2 = a_StylePacked2;

#ifdef CLIPSPACE_NEAR_ZERO
    gl_Position.z = gl_Position.z * 0.5 + 0.5;
#endif