import type { Element } from '@antv/g-lite';

export default class GElement extends HTMLElement {
  isGElement = true;
  gElement: Element | null = null;
}
