#define SDF_PX 8.0
#define DEVICE_PIXEL_RATIO 2.0
#define EDGE_GAMMA 0.105 / DEVICE_PIXEL_RATIO

uniform sampler2D u_SDFMap;
uniform float u_GammaScale: 1;
uniform vec4 u_FontColor;
uniform float u_FontSize;
uniform float u_Opacity;
uniform vec4 u_HaloColor : [1, 1, 1, 1];
uniform float u_HaloWidth : 1;
uniform float u_HaloBlur : 0.2;
// uniform bool u_debug;

varying vec2 v_UV;
varying float v_GammaScale;

void main() {
  // get sdf from atlas
  float dist = texture2D(u_SDFMap, v_UV).a;

  float fontScale = u_FontSize / 24.0;
  // lowp float buff = (256.0 - 64.0) / 256.0;
  // highp float gamma = EDGE_GAMMA / (fontScale * u_GammaScale);

  lowp float buff = (6.0 - u_HaloWidth / fontScale) / SDF_PX;
  highp float gamma = (u_HaloBlur * 1.19 / SDF_PX + EDGE_GAMMA) / (fontScale * u_GammaScale);
  
  highp float gamma_scaled = gamma * v_GammaScale;

  highp float alpha = smoothstep(buff - gamma_scaled, buff + gamma_scaled, dist);

  gl_FragColor = mix(u_FontColor * u_Opacity, u_HaloColor, smoothstep(0., .5, 1. - dist)) * alpha;

  gl_FragColor = vec4(1., 0., 0., 1.);

  // if (u_debug) {
  //   vec4 debug_color = vec4(1., 0., 0., 1.);
  //   gl_FragColor = mix(gl_FragColor, debug_color, 0.5);
  // }
}