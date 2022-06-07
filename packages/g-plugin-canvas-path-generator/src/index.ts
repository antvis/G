import type { RendererPlugin } from '@antv/g';
import { Shape } from '@antv/g';
import type { Syringe } from 'mana-syringe';
import { Module } from 'mana-syringe';
import { PathGenerator, PathGeneratorFactory } from './interfaces';
import {
  CirclePath,
  EllipsePath,
  LinePath,
  PathPath,
  PolygonPath,
  PolylinePath,
  RectPath,
} from './paths';

const containerModule = Module((register) => {
  /**
   * register shape renderers
   */
  register({
    token: { token: PathGenerator, named: Shape.CIRCLE },
    useValue: CirclePath,
  });
  register({
    token: { token: PathGenerator, named: Shape.ELLIPSE },
    useValue: EllipsePath,
  });
  register({
    token: { token: PathGenerator, named: Shape.RECT },
    useValue: RectPath,
  });
  register({
    token: { token: PathGenerator, named: Shape.LINE },
    useValue: LinePath,
  });
  register({
    token: { token: PathGenerator, named: Shape.POLYLINE },
    useValue: PolylinePath,
  });
  register({
    token: { token: PathGenerator, named: Shape.POLYGON },
    useValue: PolygonPath,
  });
  register({
    token: { token: PathGenerator, named: Shape.PATH },
    useValue: PathPath,
  });

  register({
    token: PathGeneratorFactory,
    useFactory: (ctx) => {
      return (tagName: Shape) => {
        if (ctx.container.isBoundNamed(PathGenerator, tagName)) {
          return ctx.container.getNamed(PathGenerator, tagName);
        }
        return null;
      };
    },
  });
});

export class Plugin implements RendererPlugin {
  name = 'canvas-path-generator';
  init(container: Syringe.Container): void {
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.unload(containerModule);
  }
}

export * from './interfaces';
