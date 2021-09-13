import { createSVGElement } from '../../utils/dom';
import { convertAngleUnit, DisplayObject, ParsedElement, ParsedFilterStyleProperty } from '@antv/g';

const FILTER_PREFIX = 'g-filter-';

/**
 * use SVG filters, eg. blur, brightness, contrast...
 * @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/filter
 */
export function createOrUpdateFilter(
  $def: SVGDefsElement,
  object: DisplayObject,
  $el: SVGElement,
  filters: ParsedFilterStyleProperty[],
) {
  // eg. filter="url(#f1) url(#f2)"
  const filterName = FILTER_PREFIX + object.getEntity().getName();

  const $existedFilters = $def.querySelectorAll(`[name=${filterName}]`);
  if ($existedFilters.length) {
    $existedFilters.forEach(($filter) => {
      $def.removeChild($filter);
    });
  }

  if (filters.length === 0) {
    // 'none'
    $el?.removeAttribute('filter');
  } else {
    const filterIds = filters.map(({ name, params }, i) => {
      const $filter = createSVGElement('filter') as SVGFilterElement;
      if (name === 'blur') {
        createBlur($filter, params as ParsedElement[]);
      } else if (name === 'brightness') {
        createBrightness($filter, params as ParsedElement[]);
      } else if (name === 'drop-shadow') {
        createDropShadow($filter, params as ParsedElement[]);
      } else if (name === 'contrast') {
        createContrast($filter, params as ParsedElement[]);
      } else if (name === 'grayscale') {
        createGrayscale($filter, params as ParsedElement[]);
      } else if (name === 'sepia') {
        createSepia($filter, params as ParsedElement[]);
      } else if (name === 'saturate') {
        createSaturate($filter, params as ParsedElement[]);
      } else if (name === 'hue-rotate') {
        createHueRotate($filter, params as ParsedElement[]);
      } else if (name === 'invert') {
        createInvert($filter, params as ParsedElement[]);
      }

      $filter.id = `${filterName}-${i}`;
      $filter.setAttribute('name', filterName);
      $def.appendChild($filter);

      return $filter.id;
    });

    $el?.setAttribute('filter', filterIds.map((filterId) => `url(#${filterId})`).join(' '));
  }
}

function convertToAbsoluteValue(param: ParsedElement) {
  return param.unit === '%' ? param.value / 100 : param.value;
}

/**
 * @see https://drafts.fxtf.org/filter-effects/#blurEquivalent
 */
function createBlur($filter: SVGElement, params: ParsedElement[]) {
  const $feGaussianBlur = createSVGElement('feGaussianBlur');
  $feGaussianBlur.setAttribute('in', 'SourceGraphic');
  $feGaussianBlur.setAttribute('stdDeviation', `${params[0].value}`);
  $filter.appendChild($feGaussianBlur);
}

function createFeComponentTransfer(
  $filter: SVGElement,
  {
    type,
    slope,
    intercept,
    tableValues,
  }: {
    type: string;
    slope?: number;
    intercept?: number;
    tableValues?: string;
  },
) {
  const $feComponentTransfer = createSVGElement('feComponentTransfer');
  [createSVGElement('feFuncR'), createSVGElement('feFuncG'), createSVGElement('feFuncB')].forEach(
    ($feFunc) => {
      $feFunc.setAttribute('type', type);

      if (type === 'table') {
        $feFunc.setAttribute('tableValues', `${tableValues}`);
      } else {
        $feFunc.setAttribute('slope', `${slope}`);
        $feFunc.setAttribute('intercept', `${intercept}`);
      }

      $feComponentTransfer.appendChild($feFunc);
    },
  );

  $filter.appendChild($feComponentTransfer);
}

function createContrast($filter: SVGElement, params: ParsedElement[]) {
  const slope = convertToAbsoluteValue(params[0]);
  createFeComponentTransfer($filter, {
    type: 'linear',
    slope,
    intercept: -(0.5 * slope) + 0.5,
  });
}

function createInvert($filter: SVGElement, params: ParsedElement[]) {
  const amount = convertToAbsoluteValue(params[0]);
  createFeComponentTransfer($filter, {
    type: 'table',
    tableValues: `${amount} ${1 - amount}`,
  });
}

function createBrightness($filter: SVGElement, params: ParsedElement[]) {
  const slope = convertToAbsoluteValue(params[0]);
  createFeComponentTransfer($filter, {
    type: 'linear',
    slope,
    intercept: 0,
  });
}

function createSaturate($filter: SVGElement, params: ParsedElement[]) {
  const amount = convertToAbsoluteValue(params[0]);
  const $feColorMatrix = createSVGElement('feColorMatrix');
  $feColorMatrix.setAttribute('type', 'saturate');
  $feColorMatrix.setAttribute('values', `${amount}`);
  $filter.appendChild($feColorMatrix);
}

function createHueRotate($filter: SVGElement, params: ParsedElement[]) {
  const $feColorMatrix = createSVGElement('feColorMatrix');
  $feColorMatrix.setAttribute('type', 'hueRotate');
  $feColorMatrix.setAttribute('values', `${convertAngleUnit(params[0])}`);
  $filter.appendChild($feColorMatrix);
}

function createDropShadow($filter: SVGElement, params: ParsedElement[]) {
  const shadowOffsetX = params[0].value as number;
  const shadowOffsetY = params[1].value as number;
  const shadowBlur = params[2].value as number;
  // @ts-ignore
  const shadowColor = params[3].formatted as string;
  const $feGaussianBlur = createSVGElement('feGaussianBlur');
  $feGaussianBlur.setAttribute('in', 'SourceAlpha');
  $feGaussianBlur.setAttribute('stdDeviation', `${shadowBlur}`);
  $filter!.appendChild($feGaussianBlur);

  const $feOffset = createSVGElement('feOffset');
  $feOffset.setAttribute('dx', `${shadowOffsetX}`);
  $feOffset.setAttribute('dy', `${shadowOffsetY}`);
  $feOffset.setAttribute('result', 'offsetblur');
  $filter!.appendChild($feOffset);

  const $feFlood = createSVGElement('feFlood');
  $feFlood.setAttribute('flood-color', shadowColor);
  $filter!.appendChild($feFlood);

  const $feComposite = createSVGElement('feComposite');
  $feComposite.setAttribute('in2', 'offsetblur');
  $feComposite.setAttribute('operator', 'in');
  $filter!.appendChild($feComposite);

  const $feMerge = createSVGElement('feMerge');
  $filter!.appendChild($feMerge);

  const $feMergeNode1 = createSVGElement('feMergeNode');
  const $feMergeNode2 = createSVGElement('feMergeNode');
  $feMergeNode2.setAttribute('in', 'SourceGraphic');
  $feMerge!.appendChild($feMergeNode1);
  $feMerge!.appendChild($feMergeNode2);
}

function createFeColorMatrix($filter: SVGElement, matrix: number[]) {
  const $feColorMatrix = createSVGElement('feColorMatrix');
  $feColorMatrix.setAttribute('type', 'matrix');
  $feColorMatrix.setAttribute('values', matrix.join(' '));
  $filter.appendChild($feColorMatrix);
}

/**
 * @see https://drafts.fxtf.org/filter-effects/#grayscaleEquivalent
 */
function createGrayscale($filter: SVGElement, params: ParsedElement[]) {
  const amount = convertToAbsoluteValue(params[0]);
  createFeColorMatrix($filter, [
    0.2126 + 0.7874 * (1 - amount),
    0.7152 - 0.7152 * (1 - amount),
    0.0722 - 0.0722 * (1 - amount),
    0,
    0,
    0.2126 - 0.2126 * (1 - amount),
    0.7152 + 0.2848 * (1 - amount),
    0.0722 - 0.0722 * (1 - amount),
    0,
    0,
    0.2126 - 0.2126 * (1 - amount),
    0.7152 - 0.7152 * (1 - amount),
    0.0722 + 0.9278 * (1 - amount),
    0,
    0,
    0,
    0,
    0,
    1,
    0,
  ]);
}

/**
 * @see https://drafts.fxtf.org/filter-effects/#sepiaEquivalent
 */
function createSepia($filter: SVGElement, params: ParsedElement[]) {
  const amount = convertToAbsoluteValue(params[0]);
  createFeColorMatrix($filter, [
    0.393 + 0.607 * (1 - amount),
    0.769 - 0.769 * (1 - amount),
    0.189 - 0.189 * (1 - amount),
    0,
    0,
    0.349 - 0.349 * (1 - amount),
    0.686 + 0.314 * (1 - amount),
    0.168 - 0.168 * (1 - amount),
    0,
    0,
    0.272 - 0.272 * (1 - amount),
    0.534 - 0.534 * (1 - amount),
    0.131 + 0.869 * (1 - amount),
    0,
    0,
    0,
    0,
    0,
    1,
    0,
  ]);
}
