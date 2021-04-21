varying vec4 v_StrokeColorVar;
varying vec4 v_Subpos;
varying vec4 v_Info;
varying vec4 v_Angles;

uniform float u_Antialiasing;
uniform float u_MiterLimit;

void main() {
  vec4 color = v_StrokeColorVar;
  float opacity = 1.0;
  // int nearMode = int(floor(v_Info.x + 0.5));
  // int farMode = int(floor(v_Info.y + 0.5));
  // float cosABC = v_Angles.x;
  // float sinABC = v_Angles.y;
  // float cosBCD = v_Angles.z;
  // float sinBCD = v_Angles.w;
  // // never render on the opposite side of a miter.  This uses a bit of
  // // slop, via pow(smoothstep()) instead of step(), since there are
  // // precision issues in this calculation.  This doesn't wholy solve
  // // the precision issue; sometimes pixels are missed or double
  // // rendered along the inside seam of a miter.
  // if (nearMode >= 4) {
  //   float dist = cosABC * v_Subpos.x - sinABC * v_Subpos.y;
  //   opacity = min(opacity, pow(smoothstep(-0.02, 0.02, dist), 0.5));
  //   if (opacity == 0.0) {
  //     discard;
  //   }
  // }
  // if (farMode >= 4) {
  //   float dist = cosBCD * v_Subpos.z - sinBCD * v_Subpos.y;
  //   opacity = min(opacity, pow(smoothstep(-0.02, 0.02, dist), 0.5));
  //   if (opacity == 0.0) {
  //     discard;
  //   }
  // }
  // // butt or square cap
  // if ((nearMode == 0 || nearMode == 1) && v_Subpos.x < u_Antialiasing) {
  //   opacity = min(opacity, smoothstep(-u_Antialiasing, u_Antialiasing, v_Subpos.x + v_Subpos.w * float(nearMode)));
  // }
  // if ((farMode == 0 || farMode == 1) && v_Subpos.z < u_Antialiasing) {
  //   opacity = min(opacity, smoothstep(-u_Antialiasing, u_Antialiasing, v_Subpos.z + v_Subpos.w * float(farMode)));
  // }
  // // round cap
  // if (nearMode == 2 && v_Subpos.x <= 0.0) {
  //   opacity = min(opacity, smoothstep(-u_Antialiasing, u_Antialiasing, v_Subpos.w - sqrt(pow(v_Subpos.x, 2.0) + pow(v_Subpos.y - v_Info.z * v_Subpos.w, 2.0))));
  // }
  // if (farMode == 2 && v_Subpos.z <= 0.0) {
  //   opacity = min(opacity, smoothstep(-u_Antialiasing, u_Antialiasing, v_Subpos.w - sqrt(pow(v_Subpos.z, 2.0) + pow(v_Subpos.y - v_Info.z * v_Subpos.w, 2.0))));
  // }
  // // bevel and clip joins
  // if ((nearMode == 5 || nearMode == 7) && v_Subpos.x < u_Antialiasing) {
  //   float dist = (sinABC * v_Subpos.x + cosABC * v_Subpos.y) * sign(sinABC);
  //   float w = v_Subpos.w * (1.0 - v_Info.z * sign(sinABC));
  //   float maxDist;
  //   if (nearMode == 5)  maxDist = cosABC * w;
  //   else                maxDist = u_MiterLimit * w;
  //   opacity = min(opacity, smoothstep(-u_Antialiasing, u_Antialiasing, maxDist + dist));
  // }
  // if ((farMode == 5 || farMode == 7) && v_Subpos.z < u_Antialiasing) {
  //   float dist = (sinBCD * v_Subpos.z + cosBCD * v_Subpos.y) * sign(sinBCD);
  //   float w = v_Subpos.w * (1.0 - v_Info.z * sign(sinBCD));
  //   float maxDist;
  //   if (farMode == 5)  maxDist = cosBCD * w;
  //   else               maxDist = u_MiterLimit * w;
  //   opacity = min(opacity, smoothstep(-u_Antialiasing, u_Antialiasing, maxDist + dist));
  // }
  // // round join
  // if (nearMode == 6 && v_Subpos.x <= 0.0) {
  //   float w = v_Subpos.w * (1.0 - v_Info.z * sign(sinABC));
  //   opacity = min(opacity, smoothstep(-u_Antialiasing, u_Antialiasing, w - sqrt(pow(v_Subpos.x, 2.0) + pow(v_Subpos.y, 2.0))));
  // }
  // if (farMode == 6 && v_Subpos.z <= 0.0) {
  //   float w = v_Subpos.w * (1.0 - v_Info.z * sign(sinBCD));
  //   opacity = min(opacity, smoothstep(-u_Antialiasing, u_Antialiasing, w - sqrt(pow(v_Subpos.z, 2.0) + pow(v_Subpos.y, 2.0))));
  // }
  // // antialias along main edges
  // if (u_Antialiasing > 0.0) {
  //   if (v_Subpos.y > v_Subpos.w * (1.0 + v_Info.z) - u_Antialiasing) {
  //     opacity = min(opacity, smoothstep(u_Antialiasing, -u_Antialiasing, v_Subpos.y - v_Subpos.w * (1.0 + v_Info.z)));
  //   }
  //   if (v_Subpos.y < v_Subpos.w * (-1.0 + v_Info.z) + u_Antialiasing) {
  //     opacity = min(opacity, smoothstep(-u_Antialiasing, u_Antialiasing, v_Subpos.y - v_Subpos.w * (-1.0 + v_Info.z)));
  //   }
  // }
  // if (opacity == 0.0) {
  //   discard;
  // }
  color.a *= opacity;
  gl_FragColor = color;
}