import type { DisplayObject, LinearGradient, Pattern, RadialGradient } from '@antv/g';
import {
  computeLinearGradient,
  computeRadialGradient,
  CSSGradientValue,
  CSSRGB,
  GradientPatternType,
} from '@antv/g';
import { createSVGElement } from '../../utils/dom';
import { FILTER_PREFIX } from './Filter';

const cacheKey2IDMap: Record<string, string> = {};
let counter = 0;

export function createOrUpdateGradientAndPattern(
  document: Document,
  $def: SVGDefsElement,
  object: DisplayObject,
  $el: SVGElement,
  parsedColor: CSSGradientValue[] | CSSRGB,
  name: string,
) {
  // eg. clipPath don't have fill/stroke
  if (!parsedColor) {
    return;
  }

  if (parsedColor instanceof CSSRGB) {
    // keep using currentColor @see https://github.com/d3/d3-axis/issues/49
    if (object.style[name] === 'currentColor') {
      $el?.setAttribute(name, 'currentColor');
    } else {
      // constant value, eg. '#fff'
      $el?.setAttribute(name, parsedColor.isNone ? 'none' : parsedColor.toString());
    }
  } else {
    if (parsedColor.length === 1) {
      const gradient = parsedColor[0];
      if (gradient.type === GradientPatternType.Pattern) {
        createOrUpdatePattern(document, $def, $el, name, gradient);
      } else {
        const gradientId = createOrUpdateGradient(document, object, $def, $el, gradient);
        $el?.setAttribute(name, `url(#${gradientId})`);
      }
    } else {
      // @see https://stackoverflow.com/questions/20671502/can-i-blend-gradients-in-svg
      const filterId = createOrUpdateMultiGradient(document, object, $def, $el, parsedColor);
      $el?.setAttribute(name, `url(#${filterId})`);
    }
  }
}

function generateCacheKey(params: CSSGradientValue | CSSRGB): string {
  let cacheKey = '';
  if (params instanceof CSSGradientValue) {
    const { type } = params;
    if (type === GradientPatternType.Pattern) {
      const { src } = params.value as Pattern;
      cacheKey = src;
    } else if (
      type === GradientPatternType.LinearGradient ||
      type === GradientPatternType.RadialGradient
    ) {
      // @ts-ignore
      const { type, width, height, steps, angle, cx, cy } = params.value;
      cacheKey = `${type}${width}${height}${angle || 0}${cx || 0}${cy || 0}${steps
        .map((step: string[]) => step.join(''))
        .join('')}`;
    }

    if (cacheKey) {
      if (!cacheKey2IDMap[cacheKey]) {
        cacheKey2IDMap[cacheKey] = `_pattern_${type}_${counter++}`;
      }
    }
  }

  return cacheKey2IDMap[cacheKey];
}

function createOrUpdatePattern(
  document: Document,
  $def: SVGDefsElement,
  $el: SVGElement,
  name: string,
  parsedColor: CSSGradientValue,
) {
  const patternId = generateCacheKey(parsedColor);
  const $existed = $def.querySelector(`#${patternId}`);

  if (!$existed) {
    const { src } = parsedColor.value as Pattern;
    // @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/pattern
    const $pattern = createSVGElement('pattern', document) as SVGPatternElement;
    $pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    const $image = createSVGElement('image', document);
    $pattern.appendChild($image);
    $pattern.id = patternId;
    $def.appendChild($pattern);
    $el?.setAttribute(name, `url(#${patternId})`);

    $image.setAttribute('href', src);

    const img = new window.Image();
    if (!src.match(/^data:/i)) {
      img.crossOrigin = 'Anonymous';
    }
    img.src = src;
    const onload = function () {
      $pattern.setAttribute('width', `${img.width}`);
      $pattern.setAttribute('height', `${img.height}`);
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
    // TODO: need to clear existed but no-ref <gradient>

    // <linearGradient> <radialGradient>
    // @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/linearGradient
    // @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/radialGradient
    $existed = createSVGElement(
      parsedColor.type === GradientPatternType.LinearGradient ? 'linearGradient' : 'radialGradient',
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

  if (parsedColor.type === GradientPatternType.LinearGradient) {
    const { angle } = parsedColor.value as LinearGradient;
    const { x1, y1, x2, y2 } = computeLinearGradient(width, height, angle);

    $existed.setAttribute('x1', `${x1}`);
    $existed.setAttribute('y1', `${y1}`);
    $existed.setAttribute('x2', `${x2}`);
    $existed.setAttribute('y2', `${y2}`);
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
    // @see https://github.com/antvis/g/issues/1025
    $existed.setAttribute('x', '0%');
    $existed.setAttribute('y', '0%');
    $existed.setAttribute('width', '100%');
    $existed.setAttribute('height', '100%');

    const $feComposite = createSVGElement('feComposite', document) as SVGFECompositeElement;
    $feComposite.setAttribute('in', `${filterId}-${gradients.length}`);
    $feComposite.setAttribute('in2', 'SourceGraphic');
    $feComposite.setAttribute('operator', 'in');
    $existed.appendChild($feComposite);
    $existed.id = filterId;

    $def.appendChild($existed);
  }

  /**
   * <filter id="blend-it" x="0%" y="0%" width="100%" height="100%">
        <feImage xlink:href="#wave-rect" result="myWave" x="100" y="100"/>
        <feImage xlink:href="#ry-rect" result="myRY"  x="100" y="100"/>
        <feBlend in="myWave" in2="myRY" mode="multiply" result="blendedGrad"/>
        <feComposite in="blendedGrad" in2="SourceGraphic" operator="in"/>
    </filter>
   */

  gradients.forEach((gradient, i) => {
    const gradientId = createOrUpdateGradient(document, object, $def, $el, gradient);
    const $feImage = createSVGElement('feImage', document) as SVGFEImageElement;
    $feImage.setAttribute('xlink:href', `#${gradientId}`);
    $feImage.setAttribute('result', `${filterId}-${i}`);
    $feImage.setAttribute('x', '100');
    $feImage.setAttribute('y', '100');
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

  return filterId;
}
