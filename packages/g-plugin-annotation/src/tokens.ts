import { Syringe } from '@antv/g';

export const AnnotationPluginOptions = Syringe.defineToken('');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface AnnotationPluginOptions {
  selectableStyle?: Partial<SelectableStyle>;
  isDrawingMode?: boolean;
  destroyAfterComplete?: boolean;
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
