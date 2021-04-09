attribute vec3 a_PickingColor;

varying vec4 v_PickingResult;

uniform float u_PickingStage : 0.0;
uniform float u_PickingThreshold : 1.0;

#define PICKING_NONE 0.0
#define PICKING_ENCODE 1.0
#define PICKING_HIGHLIGHT 2.0
#define COLOR_SCALE 1. / 255.

void setPickingColor(vec3 pickingColor) {
  // Stores the picking color so that the fragment shader can render it during picking
  v_PickingResult.rgb = pickingColor * COLOR_SCALE;
}