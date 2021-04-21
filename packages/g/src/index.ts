import { Canvas, CanvasContainerModule } from './Canvas';
import { DisplayObject } from './DisplayObject';
import { SHAPE, RENDERER, ShapeCfg } from './types';
import { DisplayObjectPool } from './DisplayObjectPool';

export { DisplayObjectHooks, registerDisplayObjectPlugin } from './hooks';
export * from './inversify.config';
export * from './contribution-provider';
export * from './components';
export * from './systems';
export * from './services';
export * from './plugins';
export * from './shapes';
export * from './types';
export * from './utils';
export * from './Camera';

export class Group extends DisplayObject {
  constructor({ attrs, ...rest }: ShapeCfg) {
    super({
      type: SHAPE.Group,
      attrs: {
        ...attrs,
      },
      ...rest,
    });
  }
}

export class Circle extends DisplayObject {
  constructor({ attrs, ...rest }: ShapeCfg) {
    super({
      type: SHAPE.Circle,
      attrs: {
        opacity: 1,
        ...attrs,
      },
      ...rest,
    });
  }
}

export class Ellipse extends DisplayObject {
  constructor({ attrs, ...rest }: ShapeCfg) {
    super({
      type: SHAPE.Ellipse,
      attrs: {
        opacity: 1,
        ...attrs,
      },
      ...rest,
    });
  }
}

export class Rect extends DisplayObject {
  constructor({ attrs, ...rest }: ShapeCfg) {
    super({
      type: SHAPE.Rect,
      attrs: {
        opacity: 1,
        ...attrs,
      },
      ...rest,
    });
  }
}

export class Image extends DisplayObject {
  constructor({ attrs, ...rest }: ShapeCfg) {
    super({
      type: SHAPE.Image,
      attrs: {
        opacity: 1,
        ...attrs,
      },
      ...rest,
    });
  }
}

export class Line extends DisplayObject {
  constructor({ attrs, ...rest }: ShapeCfg) {
    super({
      type: SHAPE.Line,
      attrs: {
        opacity: 1,
        strokeOpacity: 1,
        ...attrs,
      },
      ...rest,
    });
  }
}

export class Polyline extends DisplayObject {
  constructor({ attrs, ...rest }: ShapeCfg) {
    super({
      type: SHAPE.Polyline,
      attrs: {
        opacity: 1,
        strokeOpacity: 1,
        ...attrs,
      },
      ...rest,
    });
  }
}

export class Polygon extends DisplayObject {
  constructor({ attrs, ...rest }: ShapeCfg) {
    super({
      type: SHAPE.Polygon,
      attrs: {
        opacity: 1,
        strokeOpacity: 1,
        ...attrs,
      },
      ...rest,
    });
  }
}

export class Text extends DisplayObject {
  constructor({ attrs, ...rest }: ShapeCfg) {
    super({
      type: SHAPE.Text,
      attrs: {
        opacity: 1,
        text: null,
        fontSize: 12,
        fontFamily: 'sans-serif',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontVariant: 'normal',
        textAlign: 'start',
        textBaseline: 'alphabetic',
        // dropShadow: false,
        // dropShadowAlpha: 1,
        // dropShadowAngle: Math.PI / 6,
        // dropShadowBlur: 0,
        // dropShadowColor: '#000',
        // dropShadowDistance: 5,
        fill: '#000',
        // fillGradientType: TEXT_GRADIENT.LINEAR_VERTICAL,
        // fillGradientStops: [],
        letterSpacing: 0,
        lineHeight: 0,
        lineJoin: 'miter',
        lineCap: 'butt',
        lineWidth: 0,
        miterLimit: 10,
        padding: 0, // TODO: support [t, r, b, l]
        stroke: '#000',
        whiteSpace: 'pre',
        wordWrap: false,
        wordWrapWidth: 100,
        leading: 0,
        ...attrs,
      },
      ...rest,
    });
  }
}

export { CanvasContainerModule, Canvas, DisplayObject, DisplayObjectPool, RENDERER };
