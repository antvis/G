vec4 u_Color = v_Color;
vec4 u_StrokeColor = v_StrokeColor;
float u_Opacity = v_StylePacked1.x;
float u_FillOpacity = v_StylePacked1.y;
float u_StrokeOpacity = v_StylePacked1.z;
float u_StrokeWidth = v_StylePacked1.w;
float u_Visible = v_StylePacked2.x;
vec3 u_PickingColor = v_PickingResult.xyz;

if (u_Visible < 0.5) {
    discard;
}