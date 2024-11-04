import type { DisplayObject } from '@antv/g-lite';
import { isNil } from '@antv/util';
import { createSVGElement } from '../../utils/dom';

const FILTER_DROPSHADOW_PREFIX = 'g-filter-dropshadow-';

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
  const {
    shadowType = 'outer',
    shadowBlur,
    shadowColor,
    shadowOffsetX,
    shadowOffsetY,
  } = object.parsedStyle;

  const hasShadow = !isNil(shadowColor) && shadowBlur > 0;
  const shadowId = FILTER_DROPSHADOW_PREFIX + object.entity;
  let $existedFilter = $def.querySelector(`#${shadowId}`);
  if ($existedFilter) {
    const existedShadowType = $existedFilter.getAttribute('data-type');
    if (existedShadowType !== shadowType || !hasShadow) {
      // remove existed shadow
      $existedFilter.remove();
      $existedFilter = null;
    }
  }

  // <Group> also has shadowType as its default value
  // only apply shadow when blur > 0
  if (hasShadow) {
    // use filter <feDropShadow>
    // @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDropShadow
    $el?.setAttribute('filter', `url(#${shadowId})`);
  } else {
    $el?.removeAttribute('filter');
    return;
  }

  if (!$existedFilter) {
    $existedFilter = createSVGElement('filter', document) as SVGFilterElement;
    $existedFilter.setAttribute('data-type', shadowType);

    if (shadowType === 'outer') {
      const $feDropShadow = createSVGElement('feDropShadow', document);
      $feDropShadow.setAttribute('dx', `${(shadowOffsetX || 0) / 2}`);
      $feDropShadow.setAttribute('dy', `${(shadowOffsetY || 0) / 2}`);
      $feDropShadow.setAttribute('stdDeviation', `${(shadowBlur || 0) / 4}`);
      $feDropShadow.setAttribute('flood-color', shadowColor.toString());
      $existedFilter.appendChild($feDropShadow);
    } else if (shadowType === 'inner') {
      const $feComponentTransfer = createSVGElement(
        'feComponentTransfer',
        document,
      );
      $feComponentTransfer.setAttribute('in', 'SourceAlpha');
      const $feFuncA = createSVGElement('feFuncA', document);
      $feFuncA.setAttribute('type', 'table');
      $feFuncA.setAttribute('tableValues', '1 0');
      $feComponentTransfer.appendChild($feFuncA);
      $existedFilter.appendChild($feComponentTransfer);

      const $feGaussianBlur = createSVGElement('feGaussianBlur', document);
      $feGaussianBlur.setAttribute('stdDeviation', `${(shadowBlur || 0) / 4}`);
      $existedFilter.appendChild($feGaussianBlur);

      const $feOffset = createSVGElement('feOffset', document);
      $feOffset.setAttribute('dx', `${(shadowOffsetX || 0) / 2}`);
      $feOffset.setAttribute('dy', `${(shadowOffsetY || 0) / 2}`);
      $feOffset.setAttribute('result', 'offsetblur');
      $existedFilter.appendChild($feOffset);

      const $feFlood = createSVGElement('feFlood', document);
      $feFlood.setAttribute('flood-color', shadowColor.toString());
      $feFlood.setAttribute('result', 'color');
      $existedFilter.appendChild($feFlood);

      const $feComposite = createSVGElement('feComposite', document);
      $feComposite.setAttribute('in2', 'offsetblur');
      $feComposite.setAttribute('operator', 'in');
      $existedFilter.appendChild($feComposite);

      const $feComposite2 = createSVGElement('feComposite', document);
      $feComposite2.setAttribute('in2', 'SourceAlpha');
      $feComposite2.setAttribute('operator', 'in');
      $existedFilter.appendChild($feComposite2);

      const $feMerge = createSVGElement('feMerge', document);
      $existedFilter.appendChild($feMerge);
      const $feMergeNode = createSVGElement('feMergeNode', document);
      $feMergeNode.setAttribute('in', 'SourceGraphic');
      const $feMergeNode2 = createSVGElement('feMergeNode', document);
      $feMerge.appendChild($feMergeNode);
      $feMerge.appendChild($feMergeNode2);
    }

    $existedFilter.id = shadowId;
    // @see https://github.com/antvis/g/issues/1025
    $existedFilter.setAttribute('filterUnits', 'userSpaceOnUse');
    $def.appendChild($existedFilter);
    return;
  }

  if (shadowType === 'inner') {
    const $feGaussianBlur = $existedFilter
      .children[1] as SVGFEGaussianBlurElement;
    const $feOffset = $existedFilter.children[2] as SVGFEOffsetElement;
    const $feFlood = $existedFilter.children[3] as SVGFEFloodElement;
    if (name === 'shadowColor') {
      $feFlood.setAttribute('flood-color', shadowColor.toString());
    } else if (name === 'shadowBlur') {
      // half the blur radius
      // @see https://drafts.csswg.org/css-backgrounds/#shadow-blur
      // @see https://css-tricks.com/breaking-css-box-shadow-vs-drop-shadow/
      $feGaussianBlur.setAttribute('stdDeviation', `${(shadowBlur || 0) / 4}`);
    } else if (name === 'shadowOffsetX') {
      $feOffset.setAttribute('dx', `${(shadowOffsetX || 0) / 2}`);
    } else if (name === 'shadowOffsetY') {
      $feOffset.setAttribute('dy', `${(shadowOffsetY || 0) / 2}`);
    }
  } else if (shadowType === 'outer') {
    const $feDropShadow = $existedFilter.children[0] as SVGPatternElement;
    if (name === 'shadowColor') {
      $feDropShadow.setAttribute('flood-color', shadowColor.toString());
    } else if (name === 'shadowBlur') {
      // half the blur radius
      // @see https://drafts.csswg.org/css-backgrounds/#shadow-blur
      // @see https://css-tricks.com/breaking-css-box-shadow-vs-drop-shadow/
      $feDropShadow.setAttribute('stdDeviation', `${(shadowBlur || 0) / 4}`);
    } else if (name === 'shadowOffsetX') {
      $feDropShadow.setAttribute('dx', `${(shadowOffsetX || 0) / 2}`);
    } else if (name === 'shadowOffsetY') {
      $feDropShadow.setAttribute('dy', `${(shadowOffsetY || 0) / 2}`);
    }
  }
}
