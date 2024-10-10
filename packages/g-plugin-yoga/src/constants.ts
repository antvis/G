import * as yoga from 'yoga-layout-prebuilt';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace YogaConstants {
  export enum FlexDirection {
    'column' = yoga.FLEX_DIRECTION_COLUMN,
    'column-reverse' = yoga.FLEX_DIRECTION_COLUMN_REVERSE,
    'row' = yoga.FLEX_DIRECTION_ROW,
    'row-reverse' = yoga.FLEX_DIRECTION_ROW_REVERSE,
  }

  export enum JustifyContent {
    'flex-start' = yoga.JUSTIFY_FLEX_START,
    'flex-end' = yoga.JUSTIFY_FLEX_END,
    'center' = yoga.JUSTIFY_CENTER,
    'space-between' = yoga.JUSTIFY_SPACE_BETWEEN,
    'space-around' = yoga.JUSTIFY_SPACE_AROUND,
    'space-evenly' = yoga.JUSTIFY_SPACE_EVENLY,
  }

  export enum FlexWrap {
    'wrap' = yoga.WRAP_WRAP,
    'no-wrap' = yoga.WRAP_NO_WRAP,
    'wrap-reverse' = yoga.WRAP_WRAP_REVERSE,
  }

  export enum Align {
    'stretch' = yoga.ALIGN_STRETCH,
    'auto' = yoga.ALIGN_AUTO,
    'baseline' = yoga.ALIGN_BASELINE,
    'center' = yoga.ALIGN_CENTER,
    'flex-start' = yoga.ALIGN_FLEX_START,
    'flex-end' = yoga.ALIGN_FLEX_END,
    'space-between' = yoga.ALIGN_SPACE_BETWEEN,
    'space-around' = yoga.ALIGN_SPACE_AROUND,
  }

  export enum PositionType {
    'relative' = yoga.POSITION_TYPE_RELATIVE,
    'absolute' = yoga.POSITION_TYPE_ABSOLUTE,
  }

  export enum Display {
    'flex' = yoga.DISPLAY_FLEX,
    'none' = yoga.DISPLAY_NONE,
  }

  export enum YogaCustomSizeConfig {
    AUTO = 'auto',
    SCREEN_SIZE = 'screen',
    WINDOW_SIZE = 'window',
  }

  export const YogaEdges = [
    yoga.EDGE_TOP,
    yoga.EDGE_RIGHT,
    yoga.EDGE_BOTTOM,
    yoga.EDGE_LEFT,
  ];

  export interface ComputedLayout {
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
  }
}
