export type ContextId = string;

export enum LayoutTaskType {
  Layout = 'layout',
  IntrinsicSizes = 'intrinsic-sizes',
}

export interface LayoutOptions {
  /**
   *  = "block"
   */
  childDisplay: ChildDisplayType;
  /**
   * = "block-like
   */
  sizing: LayoutSizingMode;
}

enum ChildDisplayType {
  'block', // default - "blockifies" the child boxes.
  'normal',
}

enum LayoutSizingMode {
  'block-like', // default - Sizing behaves like block containers.
  'manual', // Sizing is specified by the web developer.
}

export interface IntrinsicSizes {
  readonly minContentInlineSize: number;
  readonly minContentBlockSize: number;
  readonly maxContentInlineSize: number;
  readonly maxContentBlockSize: number;
}

export interface LayoutConstraints<T = void> {
  /**
   * the available space the current layout must respect
   */
  readonly availableInlineSize: number;
  readonly availableBlockSize: number;

  /**
   * require current layout must to be exact size
   */
  readonly fixedInlineSize?: number;
  readonly fixedBlockSize?: number;

  /**
   * used to resolve percentage value
   * Web developers should resolve any percentages against the percentage sizes.
   * eg. `const value = constraints.percentageInlineSize * 0.5;`
   */
  readonly percentageInlineSize: number;
  readonly percentageBlockSize: number;

  readonly data: T;
}

export enum PropertyName {
  LAYOUT = 'display',

  LEFT = 'left',
  TOP = 'top',
  BOTTOM = 'bottom',
  RIGHT = 'right',

  WIDTH = 'width',
  HEIGHT = 'height',

  MIN_WIDTH = 'minWidth',
  MAX_WIDTH = 'maxWidth',
  MIN_HEIGHT = 'minHeight',
  MAX_HEIGHT = 'maxHeight',

  BOX_SIZING = 'boxSizing',

  PADDING = 'padding',
  PADDING_TOP = 'paddingTop',
  PADDING_BOTTOM = 'paddingBottom',
  PADDING_START = 'paddingLeft',
  PADDING_END = 'paddingRight',

  MARGIN = 'margin',
  MARGIN_TOP = 'marginTop',
  MARGIN_BOTTOM = 'marginBottom',
  MARGIN_START = 'marginLeft',
  MARGIN_END = 'marginRight',

  BORDER = 'border',
  BORDER_TOP = 'borderTop',
  BORDER_BOTTOM = 'borderBottom',
  BORDER_START = 'borderLeft',
  BORDER_END = 'borderRight',

  FLEX_DIRECTION = 'flexDirection',
  FLEX_WRAP = 'flexWrap',
  FLEX_FLOW = 'flexFlow',
  ALIGN_ITEMS = 'alignItems',
  ALIGN_CONTENT = 'alignContent',
  JUSTIFY_CONTENT = 'justifyContent',

  FLEX = 'flex',
  ALIGN_SELF = 'alignSelf',
  FLEX_SHRINK = 'flexShrink',
  FLEX_BASIS = 'flexBasis',
  FLEX_GROW = 'flexGrow',
  OFFSET_WIDTH = 'offsetWidth',
  OFFSET_HEIGHT = 'offsetHeight',
  ORDER = 'order',
}

export type MeasureFn = (
  width?: number,
  height?: number,
) => {
  width: number;
  height: number;
};

export interface ComputedLayout {
  readonly width: number;
  readonly height: number;
  readonly x: number;
  readonly y: number;
  readonly children: ComputedLayout[];
}
