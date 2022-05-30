import type { CSSRGB, CSSUnitValue, DisplayObject } from '@antv/g';
import { createSVGElement } from '../../utils/dom';

const FILTER_DROPSHADOW_PREFIX = 'filter-dropshadow-';

/**
 * use SVG filters
 * @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/filter
 */
export function createOrUpdateShadow(
  document: Document,
  $def: SVGDefsElement,
  object: DisplayObject,
  $el: SVGElement,
  name: string,
) {
  const shadowId = FILTER_DROPSHADOW_PREFIX + object.entity;
  let $existedFilter = $def.querySelector(`#${shadowId}`);
  if (!$existedFilter) {
    $existedFilter = createSVGElement('filter', document) as SVGFilterElement;
    const $feDropShadow = createSVGElement('feDropShadow', document);
    $feDropShadow.setAttribute('dx', '0');
    $feDropShadow.setAttribute('dy', '0');
    $existedFilter.appendChild($feDropShadow);
    $existedFilter.id = shadowId;
    $def.appendChild($existedFilter);
  }
  const $feDropShadow = $existedFilter.children[0] as SVGPatternElement;
  if (name === 'shadowColor') {
    const parsedColor = object.parsedStyle[name] as CSSRGB;
    $feDropShadow.setAttribute('flood-color', parsedColor.toString());
  } else if (name === 'shadowBlur') {
    const shadowBlur = object.parsedStyle[name] as CSSUnitValue;
    // half the blur radius
    // @see https://drafts.csswg.org/css-backgrounds/#shadow-blur
    // @see https://css-tricks.com/breaking-css-box-shadow-vs-drop-shadow/
    $feDropShadow.setAttribute('stdDeviation', `${((shadowBlur && shadowBlur.value) || 0) / 2}`);
  } else if (name === 'shadowOffsetX') {
    const shadowOffsetX = object.parsedStyle[name] as CSSUnitValue;
    $feDropShadow.setAttribute('dx', `${((shadowOffsetX && shadowOffsetX.value) || 0) / 2}`);
  } else if (name === 'shadowOffsetY') {
    const shadowOffsetY = object.parsedStyle[name] as CSSUnitValue;
    $feDropShadow.setAttribute('dy', `${((shadowOffsetY && shadowOffsetY.value) || 0) / 2}`);
  }

  // only apply shadow when blur > 0
  if (object.parsedStyle.shadowBlur && object.parsedStyle.shadowBlur.value > 0) {
    // use filter <feDropShadow>
    // @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDropShadow
    $el?.setAttribute('filter', `url(#${shadowId})`);
  } else {
    $el?.removeAttribute('filter');
  }
}
