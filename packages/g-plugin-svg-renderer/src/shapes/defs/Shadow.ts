import { createSVGElement } from '../../utils/dom';
import type { DisplayObject, ParsedColorStyleProperty } from '@antv/g';

const FILTER_DROPSHADOW_PREFIX = 'filter-dropshadow-';

/**
 * use SVG filters
 * @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/filter
 */
export function createOrUpdateShadow(
  $def: SVGDefsElement,
  object: DisplayObject,
  $el: SVGElement,
  name: string,
) {
  const shadowId = FILTER_DROPSHADOW_PREFIX + object.getEntity().getName();
  let $existedFilter = $def.querySelector(`#${shadowId}`);
  if (!$existedFilter) {
    $existedFilter = createSVGElement('filter') as SVGFilterElement;
    const $feDropShadow = createSVGElement('feDropShadow');
    $feDropShadow.setAttribute('dx', '0');
    $feDropShadow.setAttribute('dy', '0');
    $existedFilter.appendChild($feDropShadow);
    $existedFilter.id = shadowId;
    $def.appendChild($existedFilter);
  }
  const $feDropShadow = $existedFilter.children[0] as SVGPatternElement;
  if (name === 'shadowColor') {
    const parsedColor = object.parsedStyle[name] as ParsedColorStyleProperty;
    $feDropShadow.setAttribute('flood-color', parsedColor.formatted);
  } else if (name === 'shadowBlur') {
    // half the blur radius
    // @see https://drafts.csswg.org/css-backgrounds/#shadow-blur
    // @see https://css-tricks.com/breaking-css-box-shadow-vs-drop-shadow/
    $feDropShadow.setAttribute('stdDeviation', `${Number(object.parsedStyle[name]) / 2}`);
  } else if (name === 'shadowOffsetX') {
    $feDropShadow.setAttribute('dx', object.parsedStyle[name]);
  } else if (name === 'shadowOffsetY') {
    $feDropShadow.setAttribute('dy', object.parsedStyle[name]);
  }

  // use filter <feDropShadow>
  // @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDropShadow
  $el?.setAttribute('filter', `url(#${shadowId})`);
}
