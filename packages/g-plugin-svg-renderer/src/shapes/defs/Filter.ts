import type {
  CSSUnitValue,
  DisplayObject,
  ParsedBaseStyleProps,
} from '@antv/g-lite';
import { UnitType } from '@antv/g-lite';
import { createSVGElement } from '../../utils/dom';

export const FILTER_PREFIX = 'g-filter-';

/**
 * use SVG filters, eg. blur, brightness, contrast...
 * @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/filter
 */
export function createOrUpdateFilter(
  document: Document,
  $def: SVGDefsElement,
  object: DisplayObject,
  $el: SVGElement,
  filters: ParsedBaseStyleProps['filter'],
) {
  // eg. filter="url(#f1) url(#f2)"
  const filterName = FILTER_PREFIX + object.entity;

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
      const $filter = createSVGElement('filter', document) as SVGFilterElement;
      // @see https://github.com/antvis/g/issues/1025
      $filter.setAttribute('filterUnits', 'userSpaceOnUse');
      if (name === 'blur') {
        createBlur(document, $filter, params);
      } else if (name === 'brightness') {
        createBrightness(document, $filter, params);
      } else if (name === 'drop-shadow') {
        createDropShadow(document, $filter, params);
      } else if (name === 'contrast') {
        createContrast(document, $filter, params);
      } else if (name === 'grayscale') {
        createGrayscale(document, $filter, params);
      } else if (name === 'sepia') {
        createSepia(document, $filter, params);
      } else if (name === 'saturate') {
        createSaturate(document, $filter, params);
      } else if (name === 'hue-rotate') {
        createHueRotate(document, $filter, params);
      } else if (name === 'invert') {
        createInvert(document, $filter, params);
      }

      $filter.id = `${filterName}-${i}`;
      $filter.setAttribute('name', filterName);
      $def.appendChild($filter);

      return $filter.id;
    });

    // @see https://github.com/antvis/G/issues/1114
    setTimeout(() => {
      $el?.setAttribute(
        'filter',
        filterIds.map((filterId) => `url(#${filterId})`).join(' '),
      );
    });
  }
}

function convertToAbsoluteValue(param: CSSUnitValue) {
  return param.unit === UnitType.kPercentage ? param.value / 100 : param.value;
}

/**
 * @see https://drafts.fxtf.org/filter-effects/#blurEquivalent
 */
function createBlur(
  document: Document,
  $filter: SVGElement,
  params: CSSUnitValue[],
) {
  const $feGaussianBlur = createSVGElement('feGaussianBlur', document);
  $feGaussianBlur.setAttribute('in', 'SourceGraphic');
  $feGaussianBlur.setAttribute('stdDeviation', `${params[0].value}`);
  $filter.appendChild($feGaussianBlur);
}

function createFeComponentTransfer(
  document: Document,
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
  const $feComponentTransfer = createSVGElement(
    'feComponentTransfer',
    document,
  );
  [
    createSVGElement('feFuncR', document),
    createSVGElement('feFuncG', document),
    createSVGElement('feFuncB', document),
  ].forEach(($feFunc) => {
    $feFunc.setAttribute('type', type);

    if (type === 'table') {
      $feFunc.setAttribute('tableValues', `${tableValues}`);
    } else {
      $feFunc.setAttribute('slope', `${slope}`);
      $feFunc.setAttribute('intercept', `${intercept}`);
    }

    $feComponentTransfer.appendChild($feFunc);
  });

  $filter.appendChild($feComponentTransfer);
}

function createContrast(
  document: Document,
  $filter: SVGElement,
  params: CSSUnitValue[],
) {
  const slope = convertToAbsoluteValue(params[0]);
  createFeComponentTransfer(document, $filter, {
    type: 'linear',
    slope,
    intercept: -(0.5 * slope) + 0.5,
  });
}

function createInvert(
  document: Document,
  $filter: SVGElement,
  params: CSSUnitValue[],
) {
  const amount = convertToAbsoluteValue(params[0]);
  createFeComponentTransfer(document, $filter, {
    type: 'table',
    tableValues: `${amount} ${1 - amount}`,
  });
}

function createBrightness(
  document: Document,
  $filter: SVGElement,
  params: CSSUnitValue[],
) {
  const slope = convertToAbsoluteValue(params[0]);
  createFeComponentTransfer(document, $filter, {
    type: 'linear',
    slope,
    intercept: 0,
  });
}

function createSaturate(
  document: Document,
  $filter: SVGElement,
  params: CSSUnitValue[],
) {
  const amount = convertToAbsoluteValue(params[0]);
  const $feColorMatrix = createSVGElement('feColorMatrix', document);
  $feColorMatrix.setAttribute('type', 'saturate');
  $feColorMatrix.setAttribute('values', `${amount}`);
  $filter.appendChild($feColorMatrix);
}

function createHueRotate(
  document: Document,
  $filter: SVGElement,
  params: CSSUnitValue[],
) {
  const $feColorMatrix = createSVGElement('feColorMatrix', document);
  $feColorMatrix.setAttribute('type', 'hueRotate');
  // $feColorMatrix.setAttribute('values', `${params[0].to(UnitType.kDegrees).value}`);
  // FIXME: convert to degrees
  $feColorMatrix.setAttribute('values', `${params[0].value}`);
  $filter.appendChild($feColorMatrix);
}

function createDropShadow(
  document: Document,
  $filter: SVGElement,
  params: CSSUnitValue[],
) {
  const shadowOffsetX = params[0].value;
  const shadowOffsetY = params[1].value;
  const shadowBlur = params[2].value;
  // @ts-ignore
  const shadowColor = params[3].formatted as string;
  const $feGaussianBlur = createSVGElement('feGaussianBlur', document);
  $feGaussianBlur.setAttribute('in', 'SourceAlpha');
  $feGaussianBlur.setAttribute('stdDeviation', `${shadowBlur}`);
  $filter.appendChild($feGaussianBlur);

  const $feOffset = createSVGElement('feOffset', document);
  $feOffset.setAttribute('dx', `${shadowOffsetX}`);
  $feOffset.setAttribute('dy', `${shadowOffsetY}`);
  $feOffset.setAttribute('result', 'offsetblur');
  $filter.appendChild($feOffset);

  const $feFlood = createSVGElement('feFlood', document);
  $feFlood.setAttribute('flood-color', shadowColor);
  $filter.appendChild($feFlood);

  const $feComposite = createSVGElement('feComposite', document);
  $feComposite.setAttribute('in2', 'offsetblur');
  $feComposite.setAttribute('operator', 'in');
  $filter.appendChild($feComposite);

  const $feMerge = createSVGElement('feMerge', document);
  $filter.appendChild($feMerge);

  const $feMergeNode1 = createSVGElement('feMergeNode', document);
  const $feMergeNode2 = createSVGElement('feMergeNode', document);
  $feMergeNode2.setAttribute('in', 'SourceGraphic');
  $feMerge.appendChild($feMergeNode1);
  $feMerge.appendChild($feMergeNode2);
}

function createFeColorMatrix(
  document: Document,
  $filter: SVGElement,
  matrix: number[],
) {
  const $feColorMatrix = createSVGElement('feColorMatrix', document);
  $feColorMatrix.setAttribute('type', 'matrix');
  $feColorMatrix.setAttribute('values', matrix.join(' '));
  $filter.appendChild($feColorMatrix);
}

/**
 * @see https://drafts.fxtf.org/filter-effects/#grayscaleEquivalent
 */
function createGrayscale(
  document: Document,
  $filter: SVGElement,
  params: CSSUnitValue[],
) {
  const amount = convertToAbsoluteValue(params[0]);
  createFeColorMatrix(document, $filter, [
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
function createSepia(
  document: Document,
  $filter: SVGElement,
  params: CSSUnitValue[],
) {
  const amount = convertToAbsoluteValue(params[0]);
  createFeColorMatrix(document, $filter, [
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
