import { DisplayObject } from '@antv/g-lite';
import { Body } from 'matter-js';

export interface MatterJSPluginOptions {
  debug: boolean;
  debugContainer: HTMLElement;
  debugCanvasWidth: number;
  debugCanvasHeight: number;
  gravity: [number, number];
  gravityScale: number;
  timeStep: number;
  velocityIterations: number;
  positionIterations: number;
}

export interface MatterJSBody {
  body: Body;
  displayObject: DisplayObject;
}
