import type {
  DisplayObject,
  ParsedStyleProperty,
  ParsedColorStyleProperty,
  Pattern,
  LinearGradient,
  RadialGradient,
} from '@antv/g';
import { PARSED_COLOR_TYPE } from '@antv/g';
import { createSVGElement } from '../../utils/dom';

const cacheKey2IDMap: Record<string, string> = {};
let counter = 0;

export function createOrUpdateGradientAndPattern(
  $def: SVGDefsElement,
  object: DisplayObject,
  $el: SVGElement,
  parsedColor: ParsedColorStyleProperty,
  name: string,
) {
  const gradientId = generateCacheKey(parsedColor);
  const existed = $def.querySelector(`#${gradientId}`);
  if (
    parsedColor.type === PARSED_COLOR_TYPE.LinearGradient ||
    parsedColor.type === PARSED_COLOR_TYPE.RadialGradient
  ) {
    if (!existed) {
      createGradient($def, parsedColor, gradientId);
    }
    $el?.setAttribute(name, `url(#${gradientId})`);
  } else if (parsedColor.type === PARSED_COLOR_TYPE.Pattern) {
    if (!existed) {
      createPattern($def, parsedColor, gradientId);
    }
    $el?.setAttribute(name, `url(#${gradientId})`);
  } else {
    // constant value, eg. '#fff'
    $el?.setAttribute(name, `${parsedColor.formatted}`);
  }
}

function generateCacheKey(params: ParsedColorStyleProperty): string {
  let cacheKey = '';
  const { type } = params;
  if (type === PARSED_COLOR_TYPE.Pattern) {
    const { src } = params.value as Pattern;
    cacheKey = src;
  } else if (
    type === PARSED_COLOR_TYPE.LinearGradient ||
    type === PARSED_COLOR_TYPE.RadialGradient
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

  return cacheKey2IDMap[cacheKey];
}

function createPattern(
  $def: SVGDefsElement,
  parsedColor: ParsedStyleProperty<PARSED_COLOR_TYPE.Pattern, Pattern, string>,
  patternId: string,
) {
  const { src } = parsedColor.value;
  // @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/pattern
  const $pattern = createSVGElement('pattern') as SVGPatternElement;
  $pattern.setAttribute('patternUnits', 'userSpaceOnUse');
  const $image = createSVGElement('image');
  $pattern.appendChild($image);
  $pattern.id = patternId;
  $def.appendChild($pattern);

  $image.setAttribute('href', src);

  const img = new Image();
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

function createGradient(
  $def: SVGDefsElement,
  parsedColor:
    | ParsedStyleProperty<PARSED_COLOR_TYPE.LinearGradient, LinearGradient, string>
    | ParsedStyleProperty<PARSED_COLOR_TYPE.RadialGradient, RadialGradient, string>,
  gradientId: string,
) {
  // <linearGradient> <radialGradient>
  // @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/linearGradient
  // @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/radialGradient
  const $gradient = createSVGElement(
    parsedColor.type === PARSED_COLOR_TYPE.LinearGradient ? 'linearGradient' : 'radialGradient',
  );
  if (parsedColor.type === PARSED_COLOR_TYPE.LinearGradient) {
    const { x0, y0, x1, y1 } = parsedColor.value;
    $gradient.setAttribute('x1', `${x0}`);
    $gradient.setAttribute('y1', `${y0}`);
    $gradient.setAttribute('x2', `${x1}`);
    $gradient.setAttribute('y2', `${y1}`);
  } else {
    const { x0, y0, r1 } = parsedColor.value;
    $gradient.setAttribute('cx', `${x0}`);
    $gradient.setAttribute('cy', `${y0}`);
    $gradient.setAttribute('r', `${r1 / 2}`);
  }

  // add stops
  let innerHTML = '';
  parsedColor.value.steps.forEach(([offset, color]) => {
    innerHTML += `<stop offset="${offset}" stop-color="${color}"></stop>`;
  });
  $gradient.innerHTML = innerHTML;
  $gradient.id = gradientId;
  $def.appendChild($gradient);
}
