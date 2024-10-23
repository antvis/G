import type { DisplayObject } from '@antv/g-lite';

export interface Box2DPluginOptions {
  wasmUrl: string;
  gravity: [number, number];
  timeStep: number;
  velocityIterations: number;
  positionIterations: number;
  onContact: (objectA: DisplayObject, object: DisplayObject) => void;
}

export interface Box2DBody {
  body: Box2D.b2Body;
  fixture: Box2D.b2Fixture;
  displayObject: DisplayObject;
}
