import type { DisplayObject, LinearGradient, Pattern, RadialGradient } from '@antv/g';
import {
  computeLinearGradient,
  computeRadialGradient,
  CSSGradientValue,
  CSSRGB,
  GradientType,
  isBrowser,
  isPattern,
  isString,
} from '@antv/g';
import { createSVGElement } from '../../utils/dom';
import { FILTER_PREFIX } from './Filter';

export const PATTERN_PREFIX = 'g-pattern-';
const cacheKey2IDMap: Record<string, string> = {};
let counter = 0;

export function createOrUpdateGradientAndPattern(
  document: Document,
  $def: SVGDefsElement,
  object: DisplayObject,
  $el: SVGElement,
  parsedColor: CSSGradientValue[] | CSSRGB | Pattern,
  name: string,
  createImage: (url: string) => HTMLImageElement,
) {
  // eg. clipPath don't have fill/stroke
  if (!parsedColor) {
    return '';
  }

  if (parsedColor instanceof CSSRGB) {
    // keep using currentColor @see https://github.com/d3/d3-axis/issues/49
    if (object.style[name] === 'currentColor') {
      $el?.setAttribute(name, 'currentColor');
    } else {
      // constant value, eg. '#fff'
      $el?.setAttribute(name, parsedColor.isNone ? 'none' : parsedColor.toString());
    }
  } else if (isPattern(parsedColor)) {
    const patternId = createOrUpdatePattern(document, $def, object, parsedColor, createImage);
    // use style instead of attribute when applying <pattern>
    // @see https://stackoverflow.com/a/7723115
    $el.style[name] = `url(#${patternId})`;
    return patternId;
  } else {
    if (parsedColor.length === 1) {
      const gradientId = createOrUpdateGradient(document, object, $def, $el, parsedColor[0]);
      $el?.setAttribute(name, `url(#${gradientId})`);
      return gradientId;
    } else {
      // @see https://stackoverflow.com/questions/20671502/can-i-blend-gradients-in-svg
      const filterId = createOrUpdateMultiGradient(document, object, $def, $el, parsedColor);
      $el?.setAttribute('filter', `url(#${filterId})`);
      $el?.setAttribute('fill', 'black');
      return filterId;
    }
  }

  return '';
}

function generateCacheKey(src: CSSGradientValue | CSSRGB | Pattern): string {
  let cacheKey = '';
  if (src instanceof CSSGradientValue) {
    const { type, value } = src;
    if (type === GradientType.LinearGradient || type === GradientType.RadialGradient) {
      // @ts-ignore
      const { type, width, height, steps, angle, cx, cy } = value;
      cacheKey = `${type}${width}${height}${angle || 0}${cx || 0}${cy || 0}${steps
        .map((step: [number, string]) => step.join(''))
        .join('')}`;
    }
  } else if (isPattern(src)) {
    if (isString(src.image)) {
      cacheKey = `pattern-${src.image}-${src.repetition}`;
    } else {
      cacheKey = `pattern-${counter}`;
    }
  }

  if (cacheKey) {
    if (!cacheKey2IDMap[cacheKey]) {
      cacheKey2IDMap[cacheKey] = PATTERN_PREFIX + `${counter++}`;
    }
  }

  return cacheKey2IDMap[cacheKey];
}

function createOrUpdatePattern(
  document: Document,
  $def: SVGDefsElement,
  object: DisplayObject,
  pattern: Pattern,
  createImage: (url: string) => HTMLImageElement,
) {
  const patternId = generateCacheKey(pattern);
  const $existed = $def.querySelector(`#${patternId}`);
  if (!$existed) {
    const { image, repetition } = pattern;

    let imageURL = '';
    if (isString(image)) {
      imageURL = image;
    } else {
      if (isBrowser) {
        if (image instanceof HTMLImageElement) {
          imageURL = image.src;
        } else if (image instanceof HTMLCanvasElement) {
          imageURL = image.toDataURL();
        } else if (image instanceof HTMLVideoElement) {
          // won't support
        }
      }
    }

    if (imageURL) {
      // @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/pattern
      const $pattern = createSVGElement('pattern', document) as SVGPatternElement;
      $pattern.setAttribute('patternUnits', 'userSpaceOnUse');

      const $image = createSVGElement('image', document);

      $pattern.appendChild($image);
      $pattern.id = patternId;
      $def.appendChild($pattern);
      // use href instead of xlink:href
      // @see https://stackoverflow.com/a/13379007
      $image.setAttribute('href', imageURL);

      let img: HTMLImageElement;
      if (createImage) {
        img = createImage(imageURL);
      } else if (isBrowser) {
        img = new window.Image();
      }
      if (!imageURL.match(/^data:/i)) {
        img.crossOrigin = 'Anonymous';
        $image.setAttribute('crossorigin', 'anonymous');
      }
      img.src = imageURL;
      const onload = function () {
        $pattern.setAttribute('x', '0');
        $pattern.setAttribute('y', '0');

        const { halfExtents } = object.getGeometryBounds();

        // There is no equivalent to CSS no-repeat for SVG patterns
        // @see https://stackoverflow.com/a/33481956
        let patternWidth = img.width;
        let patternHeight = img.height;
        if (repetition === 'repeat-x') {
          patternHeight = halfExtents[1] * 2;
        } else if (repetition === 'repeat-y') {
          patternWidth = halfExtents[0] * 2;
        } else if (repetition === 'no-repeat') {
          patternWidth = halfExtents[0] * 2;
          patternHeight = halfExtents[1] * 2;
        }
        $pattern.setAttribute('width', `${patternWidth}`);
        $pattern.setAttribute('height', `${patternHeight}`);

        $image.setAttribute('x', '0');
        $image.setAttribute('y', '0');
        $image.setAttribute('width', `${img.width}`);
        $image.setAttribute('height', `${img.height}`);
      };
      if (img.complete) {
        onload();
      } else {
        img.onload = onload;
        // Fix onload() bug in IE9
        img.src = img.src;
      }
    }
  }
  return patternId;
}

function createOrUpdateGradient(
  document: Document,
  object: DisplayObject,
  $def: SVGDefsElement,
  $el: SVGElement,
  parsedColor: CSSGradientValue,
) {
  const gradientId = generateCacheKey(parsedColor);
  let $existed = $def.querySelector(`#${gradientId}`);

  if (!$existed) {
    // <linearGradient> <radialGradient>
    // @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/linearGradient
    // @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/radialGradient
    $existed = createSVGElement(
      parsedColor.type === GradientType.LinearGradient ? 'linearGradient' : 'radialGradient',
      document,
    );
    // @see https://github.com/antvis/g/issues/1025
    $existed.setAttribute('gradientUnits', 'userSpaceOnUse');
    // add stops
    let innerHTML = '';
    (parsedColor.value as LinearGradient).steps.forEach(([offset, color]) => {
      innerHTML += `<stop offset="${offset}" stop-color="${color}"></stop>`;
    });
    $existed.innerHTML = innerHTML;
    $existed.id = gradientId;
    $def.appendChild($existed);
  }

  const bounds = object.getGeometryBounds();
  const width = (bounds && bounds.halfExtents[0] * 2) || 0;
  const height = (bounds && bounds.halfExtents[1] * 2) || 0;

  if (parsedColor.type === GradientType.LinearGradient) {
    const { angle } = parsedColor.value as LinearGradient;
    const { x1, y1, x2, y2 } = computeLinearGradient(width, height, angle);

    $existed.setAttribute('x1', `${x1}`);
    $existed.setAttribute('y1', `${y1}`);
    $existed.setAttribute('x2', `${x2}`);
    $existed.setAttribute('y2', `${y2}`);

    // $existed.setAttribute('gradientTransform', `rotate(${angle})`);
  } else {
    const { cx, cy } = parsedColor.value as RadialGradient;
    const { x, y, r } = computeRadialGradient(width, height, cx, cy);
    $existed.setAttribute('cx', `${x}`);
    $existed.setAttribute('cy', `${y}`);
    $existed.setAttribute('r', `${r}`);
  }

  return gradientId;
}

function createOrUpdateMultiGradient(
  document: Document,
  object: DisplayObject,
  $def: SVGDefsElement,
  $el: SVGElement,
  gradients: CSSGradientValue[],
) {
  const filterId = FILTER_PREFIX + object.entity + '-gradient';
  let $existed = $def.querySelector(`#${filterId}`);
  if (!$existed) {
    $existed = createSVGElement('filter', document) as SVGFilterElement;
    $existed.setAttribute('filterUnits', 'userSpaceOnUse');
    // @see https://github.com/antvis/g/issues/1025
    $existed.setAttribute('x', '0%');
    $existed.setAttribute('y', '0%');
    $existed.setAttribute('width', '100%');
    $existed.setAttribute('height', '100%');

    $existed.id = filterId;

    $def.appendChild($existed);
  }

  /**
   * <rect id="wave-rect" x="0" y="0" width="100%" height="100%" fill="url(#wave)"></rect>
   * <filter id="blend-it" x="0%" y="0%" width="100%" height="100%">
        <feImage xlink:href="#wave-rect" result="myWave" x="100" y="100"/>
        <feImage xlink:href="#ry-rect" result="myRY"  x="100" y="100"/>
        <feBlend in="myWave" in2="myRY" mode="multiply" result="blendedGrad"/>
        <feComposite in="blendedGrad" in2="SourceGraphic" operator="in"/>
    </filter>
   */

  gradients.forEach((gradient, i) => {
    const gradientId = createOrUpdateGradient(document, object, $def, $el, gradient);

    const rectId = gradientId + '_rect';
    const $rect = createSVGElement('rect', document) as SVGRectElement;
    $rect.setAttribute('x', '0');
    $rect.setAttribute('y', '0');
    $rect.setAttribute('width', '100%');
    $rect.setAttribute('height', '100%');
    $rect.setAttribute('fill', `url(#${gradientId})`);
    $rect.id = rectId;
    $def.appendChild($rect);

    const $feImage = createSVGElement('feImage', document) as SVGFEImageElement;
    $feImage.setAttribute('xlink:href', `#${rectId}`);
    $feImage.setAttribute('result', `${filterId}-${i}`);
    // $feImage.setAttribute('x', '0');
    // $feImage.setAttribute('y', '0');
    // $feImage.setAttribute('width', '200');
    // $feImage.setAttribute('height', '100');
    $existed.appendChild($feImage);

    if (i > 0) {
      const $feBlend = createSVGElement('feBlend', document) as SVGFEBlendElement;
      $feBlend.setAttribute('in', `${filterId}-${i - 1}`);
      $feBlend.setAttribute('in2', `${filterId}-${i}`);
      $feBlend.setAttribute('result', `${filterId}-${i + 1}`);
      $feBlend.setAttribute('mode', 'multiply');
      $existed.appendChild($feBlend);
    }
  });

  const $feComposite = createSVGElement('feComposite', document) as SVGFECompositeElement;
  $feComposite.setAttribute('in', `${filterId}-${gradients.length}`);
  $feComposite.setAttribute('in2', 'SourceGraphic');
  $feComposite.setAttribute('operator', 'in');
  $existed.appendChild($feComposite);

  return filterId;
}
