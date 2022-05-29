export function createSVGElement(type: string, doc?: Document): SVGElement {
  return (doc || document).createElementNS('http://www.w3.org/2000/svg', type);
}
