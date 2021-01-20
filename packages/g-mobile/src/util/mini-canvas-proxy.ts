/***
 * 小程序canvas的handler，用于做兼容兜底
 */
export default class MiniCanvasProxy<T> {
  set(obj: T, prop: string, value: any): boolean {
    console.log('设置', prop, obj[prop], value);
    if (prop === 'strokeStyle') {
      obj['setStrokeStyle'](value);
    } else if (prop === 'fillStyle') {
      obj['setFillStyle'](value);
    } else if (prop === 'lineWidth') {
      obj['setLineWidth'](value);
    }
    return true;
  }

  get(obj: T, prop: string): any {
    console.log('获取', prop, obj[prop]);
    return obj[prop];
  }
}
