
export interface ElementCFG {
  zIndex?: number;
  capture?: boolean;
  visible?: boolean;
  destroyed?: boolean;
  id?: string;
  parent?: any;
  children?: any[];
  el?: any;
  [key: string]: any;
}

export interface ElementAttrs {
  [key: string]: any;
}

export interface PointType {
  readonly x: number;
  readonly y: number;
}
