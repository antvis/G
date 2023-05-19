import type { DrawerStyle } from './interface/drawer';

export interface AnnotationPluginOptions {
  /**
   * Style for selectable UI.
   */
  selectableStyle: Partial<SelectableStyle>;

  /**
   * Style for drawer.
   */
  drawerStyle: Partial<DrawerStyle>;

  /**
   * Switch between drawing mode & select mode.
   */
  isDrawingMode: boolean;

  /**
   * The length target should move after arrow key pressed in canvas coordinates.
   */
  arrowKeyStepLength: number;

  /**
   * Switch between drawing mode & select mode.
   */
  enableAutoSwitchDrawingMode: boolean;

  /**
   * Delete target with shortcuts, e.g. Delete, Esc
   */
  enableDeleteTargetWithShortcuts: boolean;

  /**
   * Delete anchors with shortcuts, e.g. Delete, Esc
   */
  enableDeleteAnchorsWithShortcuts: boolean;

  /**
   * Mid anchors used to append new vertex in Polyline & Polygon.
   */
  enableDisplayMidAnchors: boolean;

  /**
   * Enable to do brush selections continuously.
   */
  enableContinuousBrush: boolean;

  /**
   * Rotate anchor.
   */
  enableRotateAnchor: boolean;

  /**
   * How do we sort the selected objects duration a brush selection.
   */
  brushSelectionSortMode: 'behavior' | 'directional';
}

// @see http://fabricjs.com/fabric-intro-part-4#customization
export interface SelectableStyle {
  selectionFill: string;
  selectionFillOpacity: number;
  selectionStroke: string;
  selectionStrokeOpacity: number;
  selectionStrokeWidth: number;
  selectionLineDash: number | string | (string | number)[];

  /**
   * Unselected state of anchor.
   */
  anchorFill: string;
  anchorStroke: string;
  anchorSize: string | number;
  anchorFillOpacity: number;
  anchorStrokeOpacity: number;
  anchorStrokeWidth: number;

  /**
   * Selected state of anchor.
   */
  selectedAnchorFill: string;
  selectedAnchorStroke: string;
  selectedAnchorSize: string | number;
  selectedAnchorFillOpacity: number;
  selectedAnchorStrokeOpacity: number;
  selectedAnchorStrokeWidth: number;

  /**
   * Unselected state of midAnchor.
   */
  midAnchorFill: string;
  midAnchorStroke: string;
  midAnchorSize: string | number;
  midAnchorFillOpacity: number;
  midAnchorStrokeOpacity: number;
  midAnchorStrokeWidth: number;

  maskIncreasedLineWidthForHitTesting: number;

  /**
   * The vertical distance from rotate anchor to the upper edge.
   */
  rotateAnchorDistance: number;
}
