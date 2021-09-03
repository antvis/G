import { createSVGElement } from '../../utils/dom';
import type { DisplayObject, ParsedFilterStyleProperty } from '@antv/g';

const FILTER_PREFIX = 'filter-';

/**
 * use SVG filters
 * @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/filter
 */
export function createOrUpdateFilter(
  $def: SVGDefsElement,
  object: DisplayObject,
  $el: SVGElement,
  filters: ParsedFilterStyleProperty[],
) {
  const filterId = FILTER_PREFIX + object.getEntity().getName();
  let $existedFilter = $def.querySelector(`#${filterId}`);

  if (filters.length === 0) {
    // 'none'
    if ($existedFilter) {
      $def.removeChild($existedFilter);
      $el?.removeAttribute('filter');
    }
  } else {
    if (!$existedFilter) {
      $existedFilter = createSVGElement('filter') as SVGFilterElement;
      filters.forEach(({ name, params }) => {
        if (name === 'blur') {
          const $feGaussianBlur = createSVGElement('feGaussianBlur');
          $feGaussianBlur.setAttribute('in', 'SourceGraphic');
          $feGaussianBlur.setAttribute('stdDeviation', `${params[0].value}`);
          $existedFilter!.appendChild($feGaussianBlur);
        } else if (name === 'brightness') {
          const $feComponentTransfer = createSVGElement('feComponentTransfer');
          const $feFuncR = createSVGElement('feFuncR');
          const $feFuncG = createSVGElement('feFuncG');
          const $feFuncB = createSVGElement('feFuncB');
          $feComponentTransfer.appendChild($feFuncR);
          $feComponentTransfer.appendChild($feFuncG);
          $feComponentTransfer.appendChild($feFuncB);
          $feFuncR.setAttribute('type', 'linear');
          $feFuncR.setAttribute('slope', `${params[0].value}`);
          $feFuncG.setAttribute('type', 'linear');
          $feFuncG.setAttribute('slope', `${params[0].value}`);
          $feFuncB.setAttribute('type', 'linear');
          $feFuncB.setAttribute('slope', `${params[0].value}`);
          $existedFilter!.appendChild($feComponentTransfer);
        }
      });
      $existedFilter.id = filterId;
      $def.appendChild($existedFilter);
    }
    $el?.setAttribute('filter', `url(#${filterId})`);
  }
}
