export enum DrawerTool {
  Circle = 'circle',
  Rect = 'rect',
  Polygon = 'polygon',
  Polyline = 'polyline',
}

export enum DrawerEvent {
  START = 'draw:start',
  MOVE = 'draw:move',
  MODIFIED = 'draw:modify',
  COMPLETE = 'draw:complete',
  CANCEL = 'draw:cancel',
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

  /**
   * deleted
   */
  DELETED = 'deleted',
}
