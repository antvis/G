import { AbstractRendererPlugin, Shape } from '@antv/g-lite';
import type { PathGenerator } from './interfaces';
import {
  CirclePath,
  EllipsePath,
  LinePath,
  PathPath,
  PolygonPath,
  PolylinePath,
  RectPath,
} from './paths';

export class Plugin extends AbstractRendererPlugin<{
  pathGeneratorFactory: Record<Shape, PathGenerator<any>>;
}> {
  name = 'canvas-path-generator';
  init(): void {
    const pathGeneratorFactory: Record<Shape, PathGenerator<any>> = {
      [Shape.CIRCLE]: CirclePath,
      [Shape.ELLIPSE]: EllipsePath,
      [Shape.RECT]: RectPath,
      [Shape.LINE]: LinePath,
      [Shape.POLYLINE]: PolylinePath,
      [Shape.POLYGON]: PolygonPath,
      [Shape.PATH]: PathPath,
      [Shape.TEXT]: undefined,
      [Shape.GROUP]: undefined,
      [Shape.IMAGE]: undefined,
      [Shape.HTML]: undefined,
      [Shape.MESH]: undefined,
      [Shape.FRAGMENT]: undefined,
    };

    // @ts-ignore
    this.context.pathGeneratorFactory = pathGeneratorFactory;
  }
  destroy(): void {
    // @ts-ignore
    delete this.context.pathGeneratorFactory;
  }
}

export * from './interfaces';
