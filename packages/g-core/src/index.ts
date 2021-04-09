import { Canvas, CanvasContainerModule } from './Canvas';
import { Shape } from './Shape';
import { Group, isGroup } from './Group';
import { SHAPE, RENDERER, ShapeCfg } from './types';
import { GroupPool } from './GroupPool';

export * from './inversify.config';
export * from './contribution-provider';
export * from './components';
export * from './systems';
export * from './services';
export * from './shapes';
export * from './types';
export * from './utils';
export * from './Shape';

export class Circle extends Shape {
  constructor(config: ShapeCfg) {
    super({
      type: SHAPE.Circle,
      ...config,
    });
  }
}

export class Ellipse extends Shape {
  constructor(config: ShapeCfg) {
    super({
      type: SHAPE.Ellipse,
      ...config,
    });
  }
}

export class Rect extends Shape {
  constructor(config: ShapeCfg) {
    super({
      type: SHAPE.Rect,
      ...config,
    });
  }
}

export class Image extends Shape {
  constructor(config: ShapeCfg) {
    super({
      type: SHAPE.Image,
      ...config,
    });
  }
}

export { CanvasContainerModule, Canvas, Shape, Group, isGroup, GroupPool, RENDERER };
