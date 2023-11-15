#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')
#pragma glslify: import('@antv/g-shader-components/batch.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/text.both.glsl')
#pragma glslify: import('@antv/g-shader-components/uv.declaration.frag')

uniform sampler2D u_SDFMap;

#define SDF_PX 8.0

out vec4 outputColor;
float epsilon = 0.000001;

void main() {
  #pragma glslify: import('@antv/g-shader-components/batch.frag')

  float dist = texture(SAMPLER_2D(u_SDFMap), v_Uv).a;

  float fontScale = u_FontSize / 24.0;
  lowp vec4 color = u_Color;
  lowp float buff = (256.0 - 64.0) / 256.0;
  float opacity = u_FillOpacity;
  if (u_HasStroke > 0.5 && u_StrokeWidth > 0.0) {
    color = u_StrokeColor;
    buff = (6.0 - u_StrokeWidth / fontScale / 2.0) / SDF_PX;
    opacity = u_StrokeOpacity;
  }

  highp float gamma_scaled = fwidth(dist);
  highp float alpha = smoothstep(buff - gamma_scaled, buff + gamma_scaled, dist);

  opacity *= alpha * u_Opacity;

  if (u_IsPicking > 0.5) {
    if (u_PickingColor.x == 0.0 && u_PickingColor.y == 0.0 && u_PickingColor.z == 0.0) {
      discard;
    }
    outputColor = vec4(u_PickingColor, 1.0);
  } else {

    if (opacity < epsilon) {
      discard;
    }

    outputColor = color;
    outputColor.a *= opacity;
  }
}