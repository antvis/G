import { addPropertiesHandler } from '../utils/interpolation';
import { clamp } from './numeric';
import * as d3 from 'd3-color';

// color string -> [r,g,b,a]
export function rgb2arr(str: string | null) {
  // @ts-ignore
  const color = d3.color(str) as d3.RGBColor;

  const arr = [0, 0, 0, 0];
  if (color != null) {
    arr[0] = color.r / 255;
    arr[1] = color.g / 255;
    arr[2] = color.b / 255;
    arr[3] = color.opacity;
  }
  return arr;
}

function mergeColors(left: string, right: string) {
  return [left, right, (x: [number, number, number, number]) => {
    if (x[3]) {
      for (let i = 0; i < 3; i++)
        x[i] = Math.round(clamp(0, 255, x[i] * 255));
    }
    x[3] = clamp(0, 1, x[3]);
    return 'rgba(' + x.join(',') + ')';
  }];
}

addPropertiesHandler(rgb2arr, mergeColors, ['fill', 'stroke']);