#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')
#pragma glslify: import('@antv/g-shader-components/text.both.glsl')

#pragma glslify: import('@antv/g-shader-components/batch.declaration.frag')

varying vec2 v_UV;
varying float v_GammaScale;

uniform sampler2D u_SDFMap;

#define SDF_PX 8.0

void main() {
  #pragma glslify: import('@antv/g-shader-components/batch.frag')

  float dist = texture(SAMPLER_2D(u_SDFMap), v_UV).a;

  float EDGE_GAMMA = 0.105 / u_DevicePixelRatio;
  float fontScale = u_FontSize / 24.0;
  highp float gamma = EDGE_GAMMA / (fontScale * u_GammaScale);
  lowp vec4 color = u_Color;
  lowp float buff = (256.0 - 64.0) / 256.0;
  float opacity = u_FillOpacity;
  if (u_HasStroke > 0.5 && u_StrokeWidth > 0.0) {
    color = u_StrokeColor;
    gamma = (u_StrokeBlur * 1.19 / SDF_PX + EDGE_GAMMA) / (fontScale * u_GammaScale);
    buff = (6.0 - u_StrokeWidth / fontScale / 2.0) / SDF_PX;
    opacity = u_StrokeOpacity;
  }

  highp float gamma_scaled = gamma * v_GammaScale;
  highp float alpha = smoothstep(buff - gamma_scaled, buff + gamma_scaled, dist);

  gl_FragColor = color * (alpha * opacity * u_Opacity);
}