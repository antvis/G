import type { DisplayObject, Pattern, LinearGradient, RadialGradient } from '@antv/g';
import { CSSGradientValue, GradientPatternType, CSSRGB } from '@antv/g';
import { createSVGElement } from '../../utils/dom';

const cacheKey2IDMap: Record<string, string> = {};
let counter = 0;

export function createOrUpdateGradientAndPattern(
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

  const gradientId = generateCacheKey(parsedColor);
  const existed = $def.querySelector(`#${gradientId}`);

  if (parsedColor instanceof CSSRGB) {
    // keep using currentColor @see https://github.com/d3/d3-axis/issues/49
    if (object.style[name] === 'currentColor') {
      $el?.setAttribute(name, 'currentColor');
    } else {
      // constant value, eg. '#fff'
      $el?.setAttribute(name, parsedColor.toString());
    }
  } else {
    if (parsedColor.type === GradientPatternType.Pattern) {
      if (!existed) {
        createPattern($def, parsedColor, gradientId);
      }
      $el?.setAttribute(name, `url(#${gradientId})`);
    } else {
      if (!existed) {
        createGradient($def, parsedColor, gradientId);
      }
      $el?.setAttribute(name, `url(#${gradientId})`);
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

function createPattern($def: SVGDefsElement, parsedColor: CSSGradientValue, patternId: string) {
  const { src } = parsedColor.value as Pattern;
  // @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/pattern
  const $pattern = createSVGElement('pattern') as SVGPatternElement;
  $pattern.setAttribute('patternUnits', 'userSpaceOnUse');
  const $image = createSVGElement('image');
  $pattern.appendChild($image);
  $pattern.id = patternId;
  $def.appendChild($pattern);

  $image.setAttribute('href', src);

  const img = new window.Image();
  if (!src.match(/^data:/i)) {
    img.crossOrigin = 'Anonymous';
  }
  img.src = src;
  function onload() {
    $pattern.setAttribute('width', `${img.width}`);
    $pattern.setAttribute('height', `${img.height}`);
  }
  if (img.complete) {
    onload();
  } else {
    img.onload = onload;
    // Fix onload() bug in IE9
    img.src = img.src;
  }
}

function createGradient($def: SVGDefsElement, parsedColor: CSSGradientValue, gradientId: string) {
  // <linearGradient> <radialGradient>
  // @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/linearGradient
  // @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/radialGradient
  const $gradient = createSVGElement(
    parsedColor.type === GradientPatternType.LinearGradient ? 'linearGradient' : 'radialGradient',
  );
  if (parsedColor.type === GradientPatternType.LinearGradient) {
    const { x0, y0, x1, y1 } = parsedColor.value as LinearGradient;
    $gradient.setAttribute('x1', `${x0}`);
    $gradient.setAttribute('y1', `${y0}`);
    $gradient.setAttribute('x2', `${x1}`);
    $gradient.setAttribute('y2', `${y1}`);
  } else {
    const { x0, y0, r1 } = parsedColor.value as RadialGradient;
    $gradient.setAttribute('cx', `${x0}`);
    $gradient.setAttribute('cy', `${y0}`);
    $gradient.setAttribute('r', `${r1 / 2}`);
  }

  // add stops
  let innerHTML = '';
  (parsedColor.value as LinearGradient).steps.forEach(([offset, color]) => {
    innerHTML += `<stop offset="${offset}" stop-color="${color}"></stop>`;
  });
  $gradient.innerHTML = innerHTML;
  $gradient.id = gradientId;
  $def.appendChild($gradient);
}
