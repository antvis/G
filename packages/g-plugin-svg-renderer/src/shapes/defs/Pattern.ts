import type { DisplayObject, LinearGradient, Pattern, RadialGradient } from '@antv/g';
import { CSSGradientValue, CSSRGB, GradientPatternType } from '@antv/g';
import { createSVGElement } from '../../utils/dom';

const cacheKey2IDMap: Record<string, string> = {};
let counter = 0;

export function createOrUpdateGradientAndPattern(
  document: Document,
  $def: SVGDefsElement,
  object: DisplayObject,
  $el: SVGElement,
  parsedColor: CSSGradientValue | CSSRGB,
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
    if (parsedColor.type === GradientPatternType.Pattern) {
      createOrUpdatePattern(document, $def, $el, name, parsedColor);
    } else {
      createOrUpdateGradient(document, object, $def, $el, name, parsedColor);
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
      const { x0, y0, x1, y1, r1, steps } = params.value;
      cacheKey = `${type}${x0}${y0}${x1}${y1}${r1 || 0}${steps
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
  name: string,
  parsedColor: CSSGradientValue,
) {
  const gradientId = generateCacheKey(parsedColor);
  let $existed = $def.querySelector(`#${gradientId}`);

  if (!$existed) {
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
    $el?.setAttribute(name, `url(#${gradientId})`);
  }

  const bounds = object.getGeometryBounds();
  const width = (bounds && bounds.halfExtents[0] * 2) || 0;
  const height = (bounds && bounds.halfExtents[1] * 2) || 0;

  if (parsedColor.type === GradientPatternType.LinearGradient) {
    const { x0, y0, x1, y1 } = parsedColor.value as LinearGradient;
    $existed.setAttribute('x1', `${x0 * width}`);
    $existed.setAttribute('y1', `${y0 * height}`);
    $existed.setAttribute('x2', `${x1 * width}`);
    $existed.setAttribute('y2', `${y1 * height}`);
  } else {
    const r = Math.sqrt(width * width + height * height) / 2;
    const { x0, y0, r1 } = parsedColor.value as RadialGradient;
    $existed.setAttribute('cx', `${x0 * width}`);
    $existed.setAttribute('cy', `${y0 * height}`);
    $existed.setAttribute('r', `${r1 * r}`);
  }
}
