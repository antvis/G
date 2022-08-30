import type { DataURLOptions } from '@antv/g-lite';
import { AbstractRendererPlugin, Shape } from '@antv/g-lite';
import type { Canvas, InputRect } from 'canvaskit-wasm';
import { CanvaskitRendererPlugin } from './CanvaskitRendererPlugin';
import { FontLoader } from './FontLoader';
import {
  CanvaskitRendererPluginOptions,
  CircleRendererContribution,
  EllipseRendererContribution,
  ImageRendererContribution,
  LineRendererContribution,
  PathRendererContribution,
  PolygonRendererContribution,
  PolylineRendererContribution,
  RectRendererContribution,
  RendererContributionFactory,
  TextRendererContribution,
} from './interfaces';
import {
  CircleRenderer,
  EllipseRenderer,
  ImageRenderer,
  LineRenderer,
  PathRenderer,
  PolygonRenderer,
  PolylineRenderer,
  RectRenderer,
  TextRenderer,
} from './renderers';

export * from './interfaces';

// const containerModule = Module((register) => {
//   register(FontLoader);

//   register(CircleRenderer);
//   register(EllipseRenderer);
//   register(RectRenderer);
//   register(LineRenderer);
//   register(ImageRenderer);
//   register(PolylineRenderer);
//   register(PolygonRenderer);
//   register(PathRenderer);
//   register(TextRenderer);

//   register({
//     token: RendererContributionFactory,
//     useFactory: (ctx) => {
//       const cache = {};
//       return (tagName: Shape): RendererContribution => {
//         const token = shape2Token[tagName];
//         if (token && !cache[tagName]) {
//           if (ctx.container.isBound(token)) {
//             cache[tagName] = ctx.container.get<RendererContribution>(token);
//           }
//         }

//         return cache[tagName];
//       };
//     },
//   });

//   register(CanvaskitRendererPlugin);
// });

export class Plugin extends AbstractRendererPlugin {
  name = 'canvaskit-renderer';

  constructor(private options: Partial<CanvaskitRendererPluginOptions> = {}) {
    super();
  }

  init(): void {
    this.container.register(CanvaskitRendererPluginOptions, {
      useValue: {
        fonts: [],
        ...this.options,
      },
    });

    this.container.registerSingleton(FontLoader);

    const shape2Token = {
      [Shape.CIRCLE]: CircleRendererContribution,
      [Shape.ELLIPSE]: EllipseRendererContribution,
      [Shape.RECT]: RectRendererContribution,
      [Shape.IMAGE]: ImageRendererContribution,
      [Shape.TEXT]: TextRendererContribution,
      [Shape.LINE]: LineRendererContribution,
      [Shape.POLYLINE]: PolylineRendererContribution,
      [Shape.POLYGON]: PolygonRendererContribution,
      [Shape.PATH]: PathRendererContribution,
    };

    this.container.registerSingleton(CircleRenderer);
    this.container.registerSingleton(EllipseRenderer);
    this.container.registerSingleton(RectRenderer);
    this.container.registerSingleton(LineRenderer);
    this.container.registerSingleton(ImageRenderer);
    this.container.registerSingleton(PolylineRenderer);
    this.container.registerSingleton(PolygonRenderer);
    this.container.registerSingleton(PathRenderer);
    this.container.registerSingleton(TextRenderer);

    this.container.register(RendererContributionFactory, {
      useValue: (tagName: Shape | string) => {
        return this.container.resolve(shape2Token[tagName]);
      },
    });
    // this.container.load(containerModule, true);
  }

  destroy(): void {
    // this.container.remove(CanvaskitRendererPluginOptions);
    // this.container.unload(containerModule);
  }

  playAnimation(name: string, jsonStr: string, bounds?: InputRect, assets?: any) {
    return this.container
      .resolve(CanvaskitRendererPlugin)
      .playAnimation(name, jsonStr, bounds, assets);
  }

  createParticles(jsonStr: string, onFrame?: (canvas: Canvas) => void, assets?: any) {
    return this.container
      .resolve(CanvaskitRendererPlugin)
      .createParticles(jsonStr, onFrame, assets);
  }

  toDataURL(options: Partial<DataURLOptions>) {
    return this.container.resolve(CanvaskitRendererPlugin).toDataURL(options);
  }
}
