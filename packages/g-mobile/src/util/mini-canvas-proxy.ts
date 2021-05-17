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
          obj['globalAlpha'] = value;
          obj['setGlobalAlpha'](value);
        }
        break;
      case 'fontSize':
        obj['setFontSize'](value);
        break;
      case 'textAlign':
        obj['setTextAlign'](value);
        break;
      case 'fontStyle':
      case 'font':
        obj['setFont'](value);
        break;
      case 'textBaseline':
        obj['setTextBaseline'](value);
        break;
      default:
        obj[prop] = value;
    }
    return true;
  }

  get(obj: T, prop: string): any {
    if (prop === 'globalAlpha' && obj[prop] === undefined) return 1;
    if (typeof obj[prop] === 'function') {
      return obj[prop].bind(obj);
    }
    return obj[prop];
  }
}
