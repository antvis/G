export enum DrawerTool {
  Circle = 'circle',
  Rect = 'rect',
  Polygon = 'polygon',
  Polyline = 'polyline',
}

/**
 * fire custom event on target
 * @see http://fabricjs.com/docs/fabric.Object.html
 */
export enum SelectableEvent {
  SELECTED = 'selected',
  DESELECTED = 'deselected',

  /**
   * resized or definition changed
   */
  MODIFIED = 'modified',

  /**
   * dragend
   */
  MOVED = 'moved',

  /**
   * dragging
   */
  MOVING = 'moving',
}
