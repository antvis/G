import type { DisplayObject, Point, TextStyleProps } from '@antv/g-lite';

export function isPointInPath(
  displayObject: DisplayObject<TextStyleProps>,
  position: Point,
  isClipPath: boolean,
  isPointInPath: (
    displayObject: DisplayObject<TextStyleProps>,
    position: Point,
  ) => boolean,
): boolean {
  const bounds = displayObject.getGeometryBounds();

  // @see https://stackoverflow.com/questions/28706989/how-do-i-check-if-a-mouse-click-is-inside-a-rotated-text-on-the-html5-canvas-in
  return (
    position.x >= bounds.min[0] &&
    position.y >= bounds.min[1] &&
    position.x <= bounds.max[0] &&
    position.y <= bounds.max[1]
  );
}
