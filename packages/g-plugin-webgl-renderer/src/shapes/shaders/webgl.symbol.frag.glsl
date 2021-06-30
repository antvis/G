#define SDF_PX 8.0

uniform sampler2D u_SDFMap;
uniform float u_GammaScale: 1;
uniform vec4 u_FontColor;
uniform float u_FontSize;
uniform float u_FillOpacity : 1;
uniform float u_Opacity : 1;
uniform vec4 u_StrokeColor : [1, 1, 1, 1];
uniform float u_StrokeOpacity : 1;
uniform float u_StrokeWidth : 1;
uniform float u_StrokeBlur : 0.2;
uniform bool u_HasStroke;
uniform float u_DevicePixelRatio;

varying vec2 v_UV;
varying float v_GammaScale;

#pragma include "picking"

void main() {
  // get sdf from atlas
  float dist = texture2D(u_SDFMap, v_UV).a;

  float EDGE_GAMMA = 0.105 / u_DevicePixelRatio;
  float fontScale = u_FontSize / 24.0;
  highp float gamma = EDGE_GAMMA / (fontScale * u_GammaScale);
  lowp vec4 color = u_FontColor;
  lowp float buff = (256.0 - 64.0) / 256.0;
  float opacity = u_FillOpacity;
  if (u_HasStroke) {
    color = u_StrokeColor;
    gamma = (u_StrokeBlur * 1.19 / SDF_PX + EDGE_GAMMA) / (fontScale * u_GammaScale);
    buff = (6.0 - u_StrokeWidth / fontScale / 2.0) / SDF_PX;
    opacity = u_StrokeOpacity;
  }

  highp float gamma_scaled = gamma * v_GammaScale;
  highp float alpha = smoothstep(buff - gamma_scaled, buff + gamma_scaled, dist);

  gl_FragColor = color * (alpha * opacity * u_Opacity);

  gl_FragColor = filterColor(gl_FragColor);
}