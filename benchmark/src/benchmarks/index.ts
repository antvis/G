import { TestRunner } from '../base/TestRunner';
import { engine as gCanvasEngine } from './g-canvas';
import { engine as gCanvasLocalEngine } from './g-canvas-local';
import { engine as gCanvasV4Engine } from './g-canvas-v4';
import { engine as zRenderEngine } from './zrender';

export const testRunner = new TestRunner([
  gCanvasLocalEngine,
  gCanvasEngine,
  // @ts-ignore
  gCanvasV4Engine,
  // @ts-ignore
  zRenderEngine,
]);
