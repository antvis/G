import type { Element } from "@antv/g";

export default class GElement extends HTMLElement {
  isGElement = true;
  gElement: Element|null = null;

}