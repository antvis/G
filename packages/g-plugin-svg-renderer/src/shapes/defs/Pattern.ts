import type { CSSRGB, Pattern, RadialGradient } from '@antv/g-lite';
import {
  DisplayObject,
  LinearGradient,
  parseTransform,
  computeLinearGradient,
  computeRadialGradient,
  CSSGradientValue,
  GradientType,
  Rect,
  isBrowser,
  isPattern,
  isCSSRGB,
  isCSSGradientValue,
} from '@antv/g-lite';
import { isString } from '@antv/util';
import { SVGRendererPlugin } from '../../SVGRendererPlugin';
import { createSVGElement } from '../../utils/dom';
import { FILTER_PREFIX } from './Filter';

export const PATTERN_PREFIX = 'g-pattern-';
let cacheKey2IDMap: Record<string, string> = {};
let counter = 0;

export function resetPatternCounter() {
  counter = 0;
  cacheKey2IDMap = {};
}

export function createOrUpdateGradientAndPattern(
  document: Document,
  $def: SVGDefsElement,
  object: DisplayObject,
  $el: SVGElement,
  parsedColor: CSSGradientValue[] | CSSRGB | Pattern,
  name: string,
  createImage: (url: string) => HTMLImageElement,
  plugin: SVGRendererPlugin,
) {
  // eg. clipPath don't have fill/stroke
  if (!parsedColor) {
    return '';
  }

  if (isCSSRGB(parsedColor)) {
    // keep using currentColor @see https://github.com/d3/d3-axis/issues/49
    if (object.style[name] === 'currentColor') {
      $el?.setAttribute(name, 'currentColor');
    } else {
      // constant value, eg. '#fff'
      $el?.setAttribute(
        name,
        parsedColor.isNone ? 'none' : parsedColor.toString(),
      );
    }
  } else if (isPattern(parsedColor)) {
    const patternId = createOrUpdatePattern(
      document,
      $def,
      object,
      parsedColor,
      createImage,
      plugin,
    );
    // use style instead of attribute when applying <pattern>
    // @see https://stackoverflow.com/a/7723115
    $el.style[name] = `url(#${patternId})`;
    return patternId;
  } else {
    if (parsedColor.length === 1) {
      const gradientId = createOrUpdateGradient(
        document,
        object,
        $def,
        $el,
        parsedColor[0],
      );
      $el?.setAttribute(name, `url(#${gradientId})`);
      return gradientId;
    }
    // @see https://stackoverflow.com/questions/20671502/can-i-blend-gradients-in-svg
    const filterId = createOrUpdateMultiGradient(
      document,
      object,
      $def,
      $el,
      parsedColor,
    );
    $el?.setAttribute('filter', `url(#${filterId})`);
    $el?.setAttribute('fill', 'black');
    return filterId;
  }

  return '';
}

function generateCacheKey(
  src: CSSGradientValue | CSSRGB | Pattern,
  options: any = {},
): string {
  let cacheKey = '';
  if (isCSSGradientValue(src)) {
    const { type, value } = src;
    if (
      type === GradientType.LinearGradient ||
      type === GradientType.RadialGradient
    ) {
      // @ts-ignore
      const { type, x, y, width, height, steps, angle, cx, cy, size } = {
        ...value,
        ...options,
      };
      cacheKey = `gradient-${type}-${x?.toString() || 0}-${
        y?.toString() || 0
      }-${angle?.toString() || 0}-${cx?.toString() || 0}-${
        cy?.toString() || 0
      }-${size?.toString() || 0}-${width}-${height}-${steps
        .map(({ offset, color }) => `${offset}${color}`)
        .join('-')}`;
    }
  } else if (isPattern(src)) {
    if (isString(src.image)) {
      cacheKey = `pattern-${src.image}-${src.repetition}`;
    } else if ((src.image as Rect).nodeName === 'rect') {
      // use rect's entity as key
      cacheKey = `pattern-rect-${(src.image as Rect).entity}`;
    } else {
      cacheKey = `pattern-${counter}`;
    }
  }

  if (cacheKey) {
    if (!cacheKey2IDMap[cacheKey]) {
      cacheKey2IDMap[cacheKey] = `${PATTERN_PREFIX}${counter++}`;
    }
  }

  return cacheKey2IDMap[cacheKey];
}

function formatTransform(transform: string) {
  // @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/patternTransform
  // should remove unit: rotate(20deg) -> rotate(20)
  return parseTransform(transform)
    .map((parsed) => {
      const { t, d } = parsed;
      if (t === 'translate') {
        return `translate(${d[0].value} ${d[1].value})`;
      }
      if (t === 'translateX') {
        return `translate(${d[0].value} 0)`;
      }
      if (t === 'translateY') {
        return `translate(0 ${d[0].value})`;
      }
      if (t === 'rotate') {
        return `rotate(${d[0].value})`;
      }
      if (t === 'scale') {
        // scale(1) scale(1, 1)
        const newScale = d?.map((s) => s.value) || [1, 1];
        return `scale(${newScale[0]}, ${newScale[1]})`;
      }
      if (t === 'scaleX') {
        const newScale = d?.map((s) => s.value) || [1];
        return `scale(${newScale[0]}, 1)`;
      }
      if (t === 'scaleY') {
        const newScale = d?.map((s) => s.value) || [1];
        return `scale(1, ${newScale[0]})`;
      }
      if (t === 'skew') {
        const newSkew = d?.map((s) => s.value) || [0, 0];
        return `skewX(${newSkew[0]}) skewY(${newSkew[1]})`;
      }
      if (t === 'skewZ') {
        const newSkew = d?.map((s) => s.value) || [0];
        return `skewX(${newSkew[0]})`;
      }
      if (t === 'skewY') {
        const newSkew = d?.map((s) => s.value) || [0];
        return `skewY(${newSkew[0]})`;
      }
      if (t === 'matrix') {
        const [a, b, c, dd, tx, ty] = d.map((s) => s.value);
        return `matrix(${a} ${b} ${c} ${dd} ${tx} ${ty})`;
      }

      return null;
    })
    .filter((item) => item !== null)
    .join(' ');
}

function create$Pattern(
  document: Document,
  $def: SVGDefsElement,
  object: DisplayObject,
  pattern: Pattern,
  patternId: string,
  width: number,
  height: number,
) {
  const { repetition, transform } = pattern;

  // @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/pattern
  const $pattern = createSVGElement('pattern', document) as SVGPatternElement;
  if (transform) {
    $pattern.setAttribute('patternTransform', formatTransform(transform));
  }
  $pattern.setAttribute('patternUnits', 'userSpaceOnUse');

  $pattern.id = patternId;
  $def.appendChild($pattern);

  const { halfExtents, min } = object.getGeometryBounds();
  $pattern.setAttribute('x', `${min[0]}`);
  $pattern.setAttribute('y', `${min[1]}`);

  // There is no equivalent to CSS no-repeat for SVG patterns
  // @see https://stackoverflow.com/a/33481956
  let patternWidth = width;
  let patternHeight = height;
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

  return $pattern;
}

function createOrUpdatePattern(
  document: Document,
  $def: SVGDefsElement,
  object: DisplayObject,
  pattern: Pattern,
  createImage: (url: string) => HTMLImageElement,
  plugin: SVGRendererPlugin,
) {
  const patternId = generateCacheKey(pattern);
  const $existed = $def.querySelector(`#${patternId}`);
  if (!$existed) {
    const { image } = pattern;

    let imageURL = '';
    if (isString(image)) {
      imageURL = image;
    } else if (isBrowser) {
      if (image instanceof HTMLImageElement) {
        imageURL = image.src;
      } else if (image instanceof HTMLCanvasElement) {
        imageURL = image.toDataURL();
      } else if (image instanceof HTMLVideoElement) {
        // won't support
      }
    }

    if (imageURL) {
      const $image = createSVGElement('image', document);
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
        const $pattern = create$Pattern(
          document,
          $def,
          object,
          pattern,
          patternId,
          img.width,
          img.height,
        );

        $def.appendChild($pattern);
        $pattern.appendChild($image);

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
        // img.src = img.src;
      }
    }

    if ((image as Rect).nodeName === 'rect') {
      const { width, height } = (image as Rect).parsedStyle;

      const $pattern = create$Pattern(
        document,
        $def,
        image as Rect,
        pattern,
        patternId,
        width,
        height,
      );

      // traverse subtree of pattern
      (image as Rect).forEach((object: DisplayObject) => {
        plugin.createSVGDom(document, object, null);

        // @ts-ignore
        const svgElement = object.elementSVG;

        // apply local RTS transformation to <group> wrapper
        const localTransform = object.getLocalTransform();
        plugin.applyTransform(svgElement.$groupEl, localTransform);
      });

      // @ts-ignore
      const svgElement = image.elementSVG;
      $pattern.appendChild(svgElement.$groupEl);
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
  const bounds = object.getGeometryBounds();
  const width = (bounds && bounds.halfExtents[0] * 2) || 0;
  const height = (bounds && bounds.halfExtents[1] * 2) || 0;
  const min = (bounds && bounds.min) || [0, 0];

  const gradientId = generateCacheKey(parsedColor, {
    x: min[0],
    y: min[1],
    width,
    height,
  });
  let $existed = $def.querySelector(`#${gradientId}`);

  if (!$existed) {
    // <linearGradient> <radialGradient>
    // @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/linearGradient
    // @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/radialGradient
    $existed = createSVGElement(
      parsedColor.type === GradientType.LinearGradient
        ? 'linearGradient'
        : 'radialGradient',
      document,
    );
    // @see https://github.com/antvis/g/issues/1025
    $existed.setAttribute('gradientUnits', 'userSpaceOnUse');
    // add stops
    let innerHTML = '';
    (parsedColor.value as LinearGradient).steps
      // sort by offset @see https://github.com/antvis/G/issues/1171
      .sort((a, b) => a.offset.value - b.offset.value)
      .forEach(({ offset, color }) => {
        // TODO: support absolute unit like `px`
        innerHTML += `<stop offset="${
          offset.value / 100
        }" stop-color="${color}"></stop>`;
      });
    $existed.innerHTML = innerHTML;
    $existed.id = gradientId;
    $def.appendChild($existed);
  }

  if (parsedColor.type === GradientType.LinearGradient) {
    const { angle } = parsedColor.value as LinearGradient;
    const { x1, y1, x2, y2 } = computeLinearGradient(
      [min[0], min[1]],
      width,
      height,
      angle,
    );

    $existed.setAttribute('x1', `${x1}`);
    $existed.setAttribute('y1', `${y1}`);
    $existed.setAttribute('x2', `${x2}`);
    $existed.setAttribute('y2', `${y2}`);

    // $existed.setAttribute('gradientTransform', `rotate(${angle})`);
  } else {
    const { cx, cy, size } = parsedColor.value as RadialGradient;
    const { x, y, r } = computeRadialGradient(
      [min[0], min[1]],
      width,
      height,
      cx,
      cy,
      size,
    );

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
  const filterId = `${FILTER_PREFIX + object.entity}-gradient`;
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

  let blended = 0;
  gradients.forEach((gradient, i) => {
    const gradientId = createOrUpdateGradient(
      document,
      object,
      $def,
      $el,
      gradient,
    );

    const rectId = `${gradientId}_rect`;
    const $rect = createSVGElement('rect', document) as SVGRectElement;
    $rect.setAttribute('x', '0');
    $rect.setAttribute('y', '0');
    $rect.setAttribute('width', '100%');
    $rect.setAttribute('height', '100%');
    $rect.setAttribute('fill', `url(#${gradientId})`);
    $rect.id = rectId;
    $def.appendChild($rect);

    const $feImage = createSVGElement('feImage', document) as SVGFEImageElement;
    $feImage.setAttribute('href', `#${rectId}`);
    $feImage.setAttribute('result', `${filterId}-${i}`);
    $existed.appendChild($feImage);

    if (i > 0) {
      const $feBlend = createSVGElement(
        'feBlend',
        document,
      ) as SVGFEBlendElement;
      $feBlend.setAttribute(
        'in',
        i === 1 ? `${filterId}-${i - 1}` : `${filterId}-blended-${blended - 1}`,
      );
      $feBlend.setAttribute('in2', `${filterId}-${i}`);
      $feBlend.setAttribute('result', `${filterId}-blended-${blended++}`);
      // @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/blend-mode
      $feBlend.setAttribute('mode', 'multiply');
      $existed.appendChild($feBlend);
    }
  });

  const $feComposite = createSVGElement(
    'feComposite',
    document,
  ) as SVGFECompositeElement;
  $feComposite.setAttribute('in', `${filterId}-blended-${blended}`);
  $feComposite.setAttribute('in2', 'SourceGraphic');
  $feComposite.setAttribute('operator', 'in');
  $existed.appendChild($feComposite);

  return filterId;
}
