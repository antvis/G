import {
  Shape,
  DisplayObject,
  ElementEvent,
  FederatedEvent,
  RenderingPlugin,
  RenderingPluginContext,
  ParsedCircleStyleProps,
} from '@antv/g-lite';
import { G_SVG_PREFIX } from '@antv/g-plugin-svg-renderer';
import { Anchor, Ellipse, Group } from 'zdog';

export class ZdogRendererPlugin implements RenderingPlugin {
  static tag = 'ZdogSVGRenderer';

  private scene: Anchor;

  apply(context: RenderingPluginContext) {
    const { contextService, renderingService, renderingContext } = context;
    const canvas = renderingContext.root.ownerDocument.defaultView;

    const handleMounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      const { nodeName, parsedStyle, parentElement } = object;

      // @ts-ignore
      const svgElement = object.elementSVG;

      let zdogShape: Anchor;
      switch (nodeName) {
        case Shape.GROUP: {
          zdogShape = new Group();
          break;
        }
        case Shape.CIRCLE: {
          const { cx, cy, r, lineWidth, fill } =
            parsedStyle as ParsedCircleStyleProps;
          zdogShape = new Ellipse({
            diameter: 2 * r,
            stroke: lineWidth,
            color: fill.toString(),
            translate: {
              x: cx,
              y: cy,
              z: 40,
            },
          });
          break;
        }
      }

      svgElement.zdogShape = zdogShape;

      // @ts-ignore
      if (zdogShape && parentElement?.elementSVG?.zdogShape) {
        // @ts-ignore
        zdogShape.addTo(parentElement?.elementSVG?.zdogShape);
      }
    };

    renderingService.hooks.init.tap(ZdogRendererPlugin.tag, () => {
      this.scene = new Anchor();

      const $svg = contextService.getContext() as SVGSVGElement;

      // @ts-ignore
      $svg.scene = this.scene;

      canvas.addEventListener(ElementEvent.MOUNTED, handleMounted);
    });

    renderingService.hooks.endFrame.tap(ZdogRendererPlugin.tag, () => {
      const $svg = contextService.getContext() as SVGSVGElement;

      this.scene.updateGraph();

      // render to <camera>
      const $camera = $svg.querySelector(`#${G_SVG_PREFIX}-camera`);
      while ($camera.firstChild) {
        $camera.removeChild($camera.firstChild);
      }

      this.scene.renderGraphSvg($camera);
    });

    renderingService.hooks.destroy.tap(ZdogRendererPlugin.tag, () => {
      canvas.removeEventListener(ElementEvent.MOUNTED, handleMounted);
    });
  }
}
