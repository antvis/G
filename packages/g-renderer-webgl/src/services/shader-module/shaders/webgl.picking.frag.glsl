varying vec4 v_PickingResult;
uniform float u_PickingStage : 0.0;

#define PICKING_NONE 0.0
#define PICKING_ENCODE 1.0
#define PICKING_HIGHLIGHT 2.0
#define COLOR_SCALE 1. / 255.

/*
 * Returns picking color if picking enabled else unmodified argument.
 */
vec4 filterPickingColor(vec4 color) {
  vec3 pickingColor = v_PickingResult.rgb;
  // if (u_PickingStage == PICKING_ENCODE && length(pickingColor) < 0.001) {
  //   discard;
  // }
  return u_PickingStage == PICKING_ENCODE ? vec4(pickingColor, 1.0) : color;
}

/*
 * Returns picking color if picking is enabled if not
 * highlight color if this item is selected, otherwise unmodified argument.
 */
vec4 filterColor(vec4 color) {
  return filterPickingColor(color);
}
