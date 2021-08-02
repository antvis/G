export function createSVGElement(type: string): SVGElement {
  return document.createElementNS('http://www.w3.org/2000/svg', type);
}
