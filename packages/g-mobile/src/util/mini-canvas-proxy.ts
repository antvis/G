/***
 * 小程序canvas的handler，用于做兼容兜底
 */
export default class MiniCanvasProxy<T> {
  set(obj: T, prop: string, value: any): boolean {
    switch (prop) {
      case 'strokeStyle':
        obj['setStrokeStyle'](value);
        break;
      case 'fillStyle':
        obj['setFillStyle'](value);
        break;
      case 'lineWidth':
        obj['setLineWidth'](value);
        break;
      case 'lineDash':
        obj['setLineDash'](value);
        break;
      case 'globalAlpha':
        if (value || value === 0) {
          obj['setGlobalAlpha'](value);
        }
        break;
      case 'fontSize':
        obj['setFontSize'](value);
        break;
      case 'textAlign':
        obj['setTextAlign'](value);
        break;
      case 'textBaseline':
        obj['setTextBaseline'](value);
        break;
      default:
        break;
    }
    return true;
  }

  get(obj: T, prop: string): any {
    //console.log('获取', prop, obj[prop]);
    return obj[prop];
  }
}
