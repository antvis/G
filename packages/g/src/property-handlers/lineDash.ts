// format lineDash to [dash, dash]
export function parseLineDash(lineDash: number[]): number[] {
  if (lineDash && lineDash.length === 1) {
    return [lineDash[0], lineDash[0]];
  }

  return [lineDash[0], lineDash[1]];
}
