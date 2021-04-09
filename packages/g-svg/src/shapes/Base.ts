import {
  ContextService,
  ContributionProvider,
  DefaultShapeRenderer,
  fromRotationTranslationScale,
  getEuler,
  Renderable,
  SceneGraphNode,
  SHAPE,
} from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { inject, injectable, named } from 'inversify';
import { vec3 } from 'gl-matrix';
import { createSVGElement } from '../utils/dom';

export const StyleRendererContribution = Symbol('StyleRendererContribution');
export interface StyleRendererContribution {
  apply(entity: Entity, context: CanvasRenderingContext2D): void;
}

export const SHAPE_TO_TAGS: Record<SHAPE, string> = {
  [SHAPE.Rect]: 'path',
  [SHAPE.Circle]: 'circle',
  [SHAPE.Ellipse]: 'ellipse',
  [SHAPE.Image]: 'image',
  [SHAPE.Group]: 'group',
  // line: 'line',
  // path: 'path',
  // marker: 'path',
  // text: 'text',
  // polyline: 'polyline',
  // polygon: 'polygon',
  // image: 'image',
  // ellipse: 'ellipse',
  // dom: 'foreignObject',
};

export const SVG_ATTR_MAP: Record<string, string> = {
  opacity: 'opacity',
  fillStyle: 'fill',
  fill: 'fill',
  fillOpacity: 'fill-opacity',
  strokeStyle: 'stroke',
  strokeOpacity: 'stroke-opacity',
  stroke: 'stroke',
  x: 'x',
  y: 'y',
  r: 'r',
  rx: 'rx',
  ry: 'ry',
  width: 'width',
  height: 'height',
  x1: 'x1',
  x2: 'x2',
  y1: 'y1',
  y2: 'y2',
  lineCap: 'stroke-linecap',
  lineJoin: 'stroke-linejoin',
  lineWidth: 'stroke-width',
  lineDash: 'stroke-dasharray',
  lineDashOffset: 'stroke-dashoffset',
  miterLimit: 'stroke-miterlimit',
  font: 'font',
  fontSize: 'font-size',
  fontStyle: 'font-style',
  fontVariant: 'font-variant',
  fontWeight: 'font-weight',
  fontFamily: 'font-family',
  startArrow: 'marker-start',
  endArrow: 'marker-end',
  path: 'd',
  class: 'class',
  id: 'id',
  style: 'style',
  preserveAspectRatio: 'preserveAspectRatio',
};

@injectable()
export abstract class BaseRenderer extends DefaultShapeRenderer<SVGElement> {
  protected $el: SVGElement;

  abstract prepare?(context: SVGElement, entity: Entity): Promise<void>;
  abstract generatePath?(context: SVGElement, entity: Entity): void;
  abstract isInStrokeOrPath(
    entity: Entity,
    params: {
      lineWidth: number;
      x: number;
      y: number;
    }
  ): boolean;

  async onAttributeChanged(entity: Entity, name: string, value: any) {
    await super.onAttributeChanged(entity, name, value);

    if (SVG_ATTR_MAP[name]) {
      this.$el.setAttribute(SVG_ATTR_MAP[name], `${value}`);
    }

    const renderable = entity.getComponent(Renderable);
    // set dirty rectangle flag
    renderable.dirty = true;
  }

  isHit(entity: Entity, { x, y }: { x: number; y: number }) {
    // const lineWidth = this.getHitLineWidth(entity);
    // return this.isInStrokeOrPath(entity, {
    //   lineWidth,
    //   x,
    //   y,
    // });
  }

  async init(context: SVGElement, entity: Entity) {
    const sceneGraphNode = entity.getComponent(SceneGraphNode);

    const type = SHAPE_TO_TAGS[sceneGraphNode.tagName];
    if (!type) {
      throw new Error(`the type ${sceneGraphNode.tagName} is not supported by svg`);
    }
    const $el = createSVGElement(type);
    $el.id = entity.getName();
    this.$el = $el;

    // apply attributes
    for (const name in sceneGraphNode.attributes) {
      if (SVG_ATTR_MAP[name]) {
        $el.setAttribute(SVG_ATTR_MAP[name], `${sceneGraphNode.attributes[name]}`);
      }
    }

    context.appendChild($el);

    if (this.prepare) {
      await this.prepare(context, entity);
    }
  }

  render(context: SVGElement, entity: Entity) {
    // apply RTS transformation
    this.applyTransform(this.$el, entity);

    if (this.generatePath) {
      this.generatePath(context, entity);
    }

    // finish rendering, clear dirty flag
    const renderable = entity.getComponent(Renderable);
    renderable.dirty = false;
  }

  private applyTransform($el: SVGElement, entity: Entity) {
    const [ex, ey, ez] = getEuler(vec3.create(), this.sceneGraphSystem.getRotation(entity));

    const [x, y] = this.sceneGraphSystem.getPosition(entity);
    const [scaleX, scaleY] = this.sceneGraphSystem.getScale(entity);

    // gimbal lock at 90 degrees
    const rts = fromRotationTranslationScale(ex || ez, x, y, scaleX, scaleY);

    // @see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Transformations
    $el.setAttribute('transform', `matrix(${rts[0]},${rts[1]},${rts[3]},${rts[4]},${rts[6]},${rts[7]})`);
  }

  // private getHitLineWidth(entity: Entity) {
  //   const renderable = entity.getComponent(SceneGraphNode);
  //   const { stroke, lineWidth = 0, lineAppendWidth = 0 } = renderable.attributes;
  //   if (!stroke) {
  //     return 0;
  //   }
  //   return lineWidth + lineAppendWidth;
  // }
}
