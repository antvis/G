import { ContextService, fromRotationTranslationScale, getEuler, PARSED_COLOR_TYPE } from '@antv/g';
import type { ParsedBaseStyleProps, DisplayObject } from '@antv/g';
import { inject, injectable } from 'inversify';
import { isNil, isString } from '@antv/util';
import { StyleRenderer } from '@antv/g-plugin-canvas-renderer';
import { Canvas2DContextService } from './Canvas2DContextService';
import { mat4, quat, vec3 } from 'gl-matrix';

const HTML_PREFIX = 'g-html-';

@injectable()
export class HTMLRenderer implements StyleRenderer {
  @inject(ContextService)
  private contextService: Canvas2DContextService;

  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedBaseStyleProps,
    object: DisplayObject,
  ) {
    const { html } = parsedStyle;

    const $container = this.contextService.getContainer()!;

    const existedId = HTML_PREFIX + object.getEntity().getName();
    let $existedElement: HTMLElement | null = $container.querySelector('#' + existedId);
    if (!$existedElement) {
      const $div = document.createElement('div');
      $div.id = existedId;
      if (isString(html)) {
        $div.innerHTML = html;
      } else {
        $div.appendChild(html);
      }
      $container.appendChild($div);
      $existedElement = $div;
    }

    this.updateCSSStyle($existedElement!, parsedStyle, object);
  }

  private updateCSSStyle(
    $el: HTMLElement,
    parsedStyle: ParsedBaseStyleProps,
    object: DisplayObject,
  ) {
    const {
      zIndex = 0,
      visibility = 'visible',
      opacity = 1,
      fill,
      lineWidth = 0,
      lineDash,
      stroke,
      anchor,
    } = parsedStyle;

    const style: Record<string, string | number> = {};
    // use absolute position
    style.position = 'absolute';
    style.top = 0;
    style.left = 0;

    // use transform
    style.transform = `matrix(${this.extractTransform(object.getWorldTransform()).join(',')})`;

    if (anchor) {
      style.transform += ` translate(${anchor[0] * 100}%, ${anchor[0] * 100}%)`;
    }

    if (object.style.transformOrigin) {
      style.transform = object.style.transformOrigin;
    }

    // z-index
    style['z-index'] = zIndex;
    // visibility
    style.visibility = visibility;
    // opacity
    style.opacity = opacity;
    // backgroundColor
    if (fill) {
      let color = '';
      if (fill.type === PARSED_COLOR_TYPE.Constant) {
        color = fill.formatted;
      } else if (fill.type === PARSED_COLOR_TYPE.LinearGradient) {
        const steps = fill.value.steps
          .map((cur) => {
            //  ['0', '#ffffff'],
            return `${cur[1]} ${Number(cur[0]) * 100}%`;
          })
          .join(',');
        // @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient()
        color = `linear-gradient(to right, ${steps});`;
      } else if (fill.type === PARSED_COLOR_TYPE.RadialGradient) {
      } else if (fill.type === PARSED_COLOR_TYPE.Pattern) {
      }
      style.background = color;
    }

    // border
    style['border-width'] = `${lineWidth}px`;
    if (stroke && stroke.type === PARSED_COLOR_TYPE.Constant) {
      style['border-color'] = stroke.formatted;
      style['border-style'] = 'solid';
    }
    if (lineDash) {
      style['border-style'] = 'dashed';
    }

    // filters
    if (object.style.filter) {
      // use unparsed filter directly
      style.filter = object.style.filter;
    }

    $el.setAttribute(
      'style',
      Object.keys(style)
        .map((key) => `${key}:${style[key]}`)
        .join(';'),
    );
  }

  private extractTransform(transform: mat4) {
    const [tx, ty] = mat4.getTranslation(vec3.create(), transform);
    const [sx, sy] = mat4.getScaling(vec3.create(), transform);
    const rotation = mat4.getRotation(quat.create(), transform);
    const [eux, euy, euz] = getEuler(vec3.create(), rotation);

    // gimbal lock at 90 degrees
    const rts = fromRotationTranslationScale(eux || euz, tx, ty, sx, sy);

    // @see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Transformations
    return [rts[0], rts[1], rts[3], rts[4], rts[6], rts[7]];
  }
}
