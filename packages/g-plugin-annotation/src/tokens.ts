export const AnnotationPluginOptions = Symbol('AnnotationPluginOptions');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface AnnotationPluginOptions {
  /**
   * Style for selectable UI.
   */
  selectableStyle?: Partial<SelectableStyle>;
  /**
   * Switch between drawing mode & select mode.
   */
  isDrawingMode?: boolean;
  /**
   * The length target should move after arrwo key pressed in canvas coordinates.
   */
  arrowKeyStepLength: number;
}

// @see http://fabricjs.com/fabric-intro-part-4#customization
export interface SelectableStyle {
  selectionFill: string;
  selectionFillOpacity: number;
  selectionStroke: string;
  selectionStrokeOpacity: number;
  selectionStrokeWidth: number;
  selectionLineDash: number | string | (string | number)[];
  anchorFill: string;
  anchorStroke: string;
  anchorSize: string | number;
  anchorFillOpacity: number;
  anchorStrokeOpacity: number;
  anchorStrokeWidth: number;
}
