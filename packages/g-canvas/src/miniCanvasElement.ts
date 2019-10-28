// 主要是为了适配支付宝，微信小程序等，构造一个简单的CanvasElement对象

const CAPITALIZED_ATTRS_MAP = {
  fillStyle: 'FillStyle',
  fontSize: 'FontSize',
  globalAlpha: 'GlobalAlpha',
  opacity: 'GlobalAlpha',
  lineCap: 'LineCap',
  lineJoin: 'LineJoin',
  lineWidth: 'LineWidth',
  miterLimit: 'MiterLimit',
  strokeStyle: 'StrokeStyle',
  textAlign: 'TextAlign',
  textBaseline: 'TextBaseline',
  shadow: 'Shadow',
};

class MiniCanvasElement {
  ctx: CanvasRenderingContext2D = null;

  constructor(ctx) {
    this.ctx = ctx;
    this._initContext(ctx);
  }

  getContext(contextId: string = '2d') {
    return this.ctx;
  }

  _initContext(ctx) {
    if (!ctx) return;
    Object.keys(CAPITALIZED_ATTRS_MAP).map((key) => {
      Object.defineProperty(ctx, key, {
        set(value) {
          // myCtx.setShadow(shadowOffsetX, shadowOffsetY, shadowBlur, shadowColor)
          if (key === 'shadow' && ctx.setShadow && Array.isArray(value)) {
            ctx.setShadow(value[0], value[1], value[2], value[3]);
          } else {
            const name = `set${CAPITALIZED_ATTRS_MAP[key]}`;
            ctx[name](value);
          }
        },
      });
      return key;
    });
  }
}

export default MiniCanvasElement;
