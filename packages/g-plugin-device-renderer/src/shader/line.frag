#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')

#pragma glslify: import('@antv/g-shader-components/batch.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/uv.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/map.declaration.frag')

in vec4 v_Dash;

in vec4 v_Distance;
in vec4 v_Arc;
in float v_Type;
in float v_Travel;
in float v_ScalingFactor;

out vec4 outputColor;
float epsilon = 0.000001;

void main(){
  #pragma glslify: import('@antv/g-shader-components/batch.frag')
  #pragma glslify: import('@antv/g-shader-components/map.frag')

  float alpha = 1.0;
  float lineWidth = v_Distance.w;
  if (v_Type < 0.5) {
    float left = max(v_Distance.x - 0.5, -v_Distance.w);
    float right = min(v_Distance.x + 0.5, v_Distance.w);
    float near = v_Distance.y - 0.5;
    float far = min(v_Distance.y + 0.5, 0.0);
    float top = v_Distance.z - 0.5;
    float bottom = min(v_Distance.z + 0.5, 0.0);
    alpha = max(right - left, 0.0) * max(bottom - top, 0.0) * max(far - near, 0.0);
  } else if (v_Type < 1.5) {
    float a1 = clamp(v_Distance.x + 0.5 - lineWidth, 0.0, 1.0);
    float a2 = clamp(v_Distance.x + 0.5 + lineWidth, 0.0, 1.0);
    float b1 = clamp(v_Distance.y + 0.5 - lineWidth, 0.0, 1.0);
    float b2 = clamp(v_Distance.y + 0.5 + lineWidth, 0.0, 1.0);
    alpha = a2 * b2 - a1 * b1;
  } else if (v_Type < 2.5) {
    alpha *= max(min(v_Distance.x + 0.5, 1.0), 0.0);
    alpha *= max(min(v_Distance.y + 0.5, 1.0), 0.0);
    alpha *= max(min(v_Distance.z + 0.5, 1.0), 0.0);
  } else if (v_Type < 3.5) {
    float a1 = clamp(v_Distance.x + 0.5 - lineWidth, 0.0, 1.0);
    float a2 = clamp(v_Distance.x + 0.5 + lineWidth, 0.0, 1.0);
    float b1 = clamp(v_Distance.y + 0.5 - lineWidth, 0.0, 1.0);
    float b2 = clamp(v_Distance.y + 0.5 + lineWidth, 0.0, 1.0);
    float alpha_miter = a2 * b2 - a1 * b1;
    float alpha_plane = max(min(v_Distance.z + 0.5, 1.0), 0.0);
    float d = length(v_Arc.xy);
    float circle_hor = max(min(v_Arc.w, d + 0.5) - max(-v_Arc.w, d - 0.5), 0.0);
    float circle_vert = min(v_Arc.w * 2.0, 1.0);
    float alpha_circle = circle_hor * circle_vert;
    alpha = min(alpha_miter, max(alpha_circle, alpha_plane));
  } else {
    float a1 = clamp(v_Distance.x + 0.5 - lineWidth, 0.0, 1.0);
    float a2 = clamp(v_Distance.x + 0.5 + lineWidth, 0.0, 1.0);
    float b1 = clamp(v_Distance.y + 0.5 - lineWidth, 0.0, 1.0);
    float b2 = clamp(v_Distance.y + 0.5 + lineWidth, 0.0, 1.0);
    alpha = a2 * b2 - a1 * b1;
    alpha *= max(min(v_Distance.z + 0.5, 1.0), 0.0);
  }

  float u_Dash = v_Dash.x;
  float u_Gap = v_Dash.y;
  float u_DashOffset = v_Dash.z;
  if (u_Dash + u_Gap > 1.0) {
    float travel = mod(v_Travel + u_Gap * v_ScalingFactor * 0.5 + u_DashOffset, u_Dash * v_ScalingFactor + u_Gap * v_ScalingFactor) - (u_Gap * v_ScalingFactor * 0.5);
    float left = max(travel - 0.5, -0.5);
    float right = min(travel + 0.5, u_Gap * v_ScalingFactor + 0.5);
    alpha *= max(0.0, right - left);
  }

  if (u_IsPicking > 0.5) {
    vec3 pickingColor = u_PickingColor;
    if (pickingColor.x == 0.0 && pickingColor.y == 0.0 && pickingColor.z == 0.0) {
      discard;
    }
    outputColor = vec4(pickingColor, 1.0);
  } else {
    outputColor = u_StrokeColor;
    #ifdef USE_MAP
      outputColor = u_Color;
    #endif

    outputColor.a *= alpha * u_Opacity * u_StrokeOpacity;
    if (outputColor.a < epsilon) {
      discard;
    }
  }
}