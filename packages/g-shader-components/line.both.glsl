layout(std140) uniform ub_ObjectParams {
    mat4 u_ModelMatrix;
    vec4 u_Color;
    vec4 u_StrokeColor;
    float u_StrokeWidth;
    float u_Opacity;
    float u_FillOpacity;
    float u_StrokeOpacity;
    float u_Expand;
    float u_MiterLimit;
    float u_ScaleMode;
    float u_Alignment;
    vec4 u_PickingColor;
    float u_Dash;
    float u_Gap;
    vec2 u_Anchor;
    float u_DashOffset;
    float u_Visible;
};