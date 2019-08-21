export function xAt(psi: number, rx: number, ry: number, cx: number, t: number): number {
  return rx * Math.cos(psi) * Math.cos(t) - ry * Math.sin(psi) * Math.sin(t) + cx;
}

export function yAt(psi: number, rx: number, ry: number, cy: number, t: number): number {
  return rx * Math.sin(psi) * Math.cos(t) + ry * Math.cos(psi) * Math.sin(t) + cy;
}

export function xExtrema(psi: number, rx: number, ry: number): number {
  return Math.atan((-ry / rx) * Math.tan(psi));
}

export function yExtrema(psi: number, rx: number, ry: number): number {
  return Math.atan(ry / (rx * Math.tan(psi)));
}
