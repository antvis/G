varying vec2 v_UV;

uniform float u_Opacity : 1;
uniform sampler2D u_Texture;

void main() {
  gl_FragColor = vec4(texture2D(u_Texture, v_UV));
  gl_FragColor.a = gl_FragColor.a * u_Opacity;
}
