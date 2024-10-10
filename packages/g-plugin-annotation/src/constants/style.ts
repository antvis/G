import type { BaseStyleProps, CircleStyleProps, Cursor } from '@antv/g-lite';

export const DRAW_LINE_STYLE: BaseStyleProps = {
  lineWidth: 2,
  stroke: '#FAAD14',
  lineDash: '0',
};

export const DASH_LINE_STYLE: BaseStyleProps = {
  lineWidth: 2.5,
  stroke: '#FAAD14',
  lineDash: '6',
};

export const HOVER_DRAWPOINT_STYLE: CircleStyleProps = {
  r: 8,
  fill: '#FAAD14',
  stroke: '#FAAD14',
  strokeOpacity: 0.2,
  lineWidth: 4,
  cursor: 'pointer',
  zIndex: 99,
};

export const ACTIVE_DRAWPOINT_STYLE: CircleStyleProps = {
  r: 6,
  fill: '#FAAD14',
  stroke: '#FAAD14',
  strokeOpacity: 0.2,
  lineWidth: 4,
  cursor: 'pointer',
  zIndex: 99,
};

export const NORMAL_DRAWPOINT_STYLE: CircleStyleProps = {
  r: 6,
  fill: '#FFFFFF',
  stroke: '#FAAD14',
  strokeOpacity: 1,
  lineWidth: 2,
  cursor: 'pointer',
  zIndex: 99,
};

export const CURSOR_STYLE: Record<string, Cursor> = {
  default: 'default',
  draw: 'crosshair',
  click: 'pointer',
  drag: 'grabbing',
  hover: 'grab',
  move: 'move',
};

// rect/polygon
export const DEFAULT_STYLE: BaseStyleProps = {
  lineWidth: 2,
  stroke: '#1890FF',
  strokeOpacity: 1,
  fill: null,
  cursor: 'pointer',
  pointerEvents: 'auto',
};

// rect/polygon
export const DEFAULT_AREA_HOVER_STYLE = {
  lineWidth: 2.5,
  stroke: '#1890FF',
  fill: '#1890FF',
  fillOpacity: 0.15,
};

// polyline
export const DEFAULT_LINE_STYLE: BaseStyleProps = {
  lineWidth: 2,
  stroke: '#1890FF',
  cursor: 'pointer',
  shadowColor: '',
  shadowBlur: 0,
};

// polyline
export const DEFAULT_LINE_HOVER_STYLE: BaseStyleProps = {
  lineWidth: 2,
  shadowColor: '#1890FF',
  shadowBlur: 15,
  stroke: '#1890FF',
};

export const ACTIVE_AREA_STYLE = {};

// point
export const NORMAL_POINT_STYLE: CircleStyleProps = {
  r: 6,
  fill: '#1890FF',
  cursor: 'pointer',
  stroke: null,
};

export const HOVER_POINT_STYLE: CircleStyleProps = {
  r: 6,
  fill: '#FAAD14',
  stroke: '#FAAD14',
  strokeOpacity: 0.2,
  lineWidth: 4,
  cursor: 'pointer',
};

export const EDIT_POINT_STYLE: CircleStyleProps = {
  r: 6,
  fill: '#FFFFFF',
  stroke: '#FAAD14',
  strokeOpacity: 1,
  lineWidth: 2,
  cursor: 'pointer',
};

export const getDrawPointStyle = (type: 'normal' | 'hover' | 'active') => {
  let style: BaseStyleProps;
  switch (type) {
    case 'normal':
      style = NORMAL_DRAWPOINT_STYLE;
      break;
    case 'hover':
      style = HOVER_DRAWPOINT_STYLE;
      break;
    case 'active':
      style = ACTIVE_DRAWPOINT_STYLE;
      break;
  }
  return style;
};
