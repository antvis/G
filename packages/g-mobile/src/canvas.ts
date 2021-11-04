import { AbstractCanvas, CanvasCfg, Point } from '@antv/g-base';
import { ChangeType } from '@antv/g-base';
import { IElement } from './interfaces';
import { getShape } from './util/hit';
import * as Shape from './shape';
import Group from './group';
import { each, getPixelRatio } from './util/util';
import { requestAnimationFrame, clearAnimationFrame, setExtraFunction } from './util/time';
import { applyAttrsToContext, drawChildren, getMergedRegion, mergeView, checkRefresh, clearChanged } from './util/draw';
import EventController from './events';
import CanvasProxy from './util/mini-canvas-proxy';
import miniPatch from './patch';

class Canvas extends AbstractCanvas {
  constructor(cfg: CanvasCfg) {
    super(cfg);

    const ctx = this.get('context');

    if (this.isMini()) {
      if (this.isMiniNative()) {
        // TODO 这里会传递过来extra，里面包含一些来自各个平台的优化函数
        setExtraFunction(this.get('container'));
      } else {
        // 小程序使用了自定义的canvas api，不兼容w3c标准
        this.set('context', new Proxy(ctx, new CanvasProxy()));
      }

      // 架构调整前，打一些patch
      miniPatch(ctx, this);
    }
  }

  isMiniNative() {
    return this.get('renderer') === 'mini-native';
  }

  isMini() {
    return this.get('renderer').startsWith('mini');
  }

  public getDefaultCfg() {
    const cfg = super.getDefaultCfg();
    // 设置渲染引擎为 canvas(h5)/mini(小程序)，只读属性
    cfg['renderer'] = 'canvas';
    // 是否自动绘制，不需要用户调用 draw 方法
    cfg['autoDraw'] = true;
    // 是否允许局部刷新图表
    cfg['localRefresh'] = true;
    cfg['refreshElements'] = [];
    // 是否在视图内自动裁剪
    cfg['clipView'] = true;
    // 是否使用快速拾取的方案，默认为 false，上层可以打开
    cfg['quickHit'] = false;
    // 给一个默认的rect，防止出现问题
    cfg['boundingClientRect'] = {
      width: 0,
      height: 0,
      left: 0,
      top: 0,
      bottom: 0,
      right: 0,
    };
    return cfg;
  }

  /**
   * @protected
   * 初始化绑定的事件
   */
  initEvents() {
    const eventController = new EventController({
      canvas: this,
    });
    this.set('eventController', eventController);
  }

  public registerEventCallback(e): void {
    const eventController = this.get('eventController');
    eventController.handleEvent(e);
  }

  /**
   * @protected
   * 清理所有的事件
   */
  clearEvents() {
    const eventController = this.get('eventController');
    eventController.destroy();
  }

  /**
   * 一些方法调用会引起画布变化
   * @param {ChangeType} changeType 改变的类型
   */
  onCanvasChange(changeType: ChangeType) {
    /**
     * 触发画布更新的三种 changeType
     * 1. attr: 修改画布的绘图属性
     * 2. sort: 画布排序，图形的层次会发生变化
     * 3. changeSize: 改变画布大小
     */
    if (changeType === 'attr' || changeType === 'sort' || changeType === 'changeSize') {
      this.set('refreshElements', [this]);
      this.draw();
    }
  }

  getShapeBase() {
    return Shape;
  }

  getGroupBase() {
    return Group;
  }
  /**
   * 获取屏幕像素比
   */
  getPixelRatio() {
    const pixelRatio = this.get('pixelRatio') || getPixelRatio();
    // 不足 1 的取 1，超出 1 的取整
    return pixelRatio >= 1 ? Math.ceil(pixelRatio) : 1;
  }

  getViewRange() {
    return {
      minX: 0,
      minY: 0,
      maxX: this.cfg.width,
      maxY: this.cfg.height,
    };
  }

  initDom() {
    if (this.isMini()) {
      const context = this.get('context');
      const pixelRatio = this.getPixelRatio();
      // 设置 canvas 元素的宽度和高度，会重置缩放，因此 context.scale 需要在每次设置宽、高后调用
      if (pixelRatio > 1) {
        context.scale(pixelRatio, pixelRatio);
      }
      return;
    }
    super.initDom();
  }

  // 复写基类的方法生成标签（非 mini renderer 的 super.initDom 调用）
  createDom(): HTMLElement {
    const element = document.createElement('canvas');
    const context = element.getContext('2d');
    // 缓存 context 对象
    this.set('context', context);
    return element;
  }

  setDOMSize(width: number, height: number) {
    super.setDOMSize(width, height);
    const context = this.get('context');
    const el = this.get('el');
    const pixelRatio = this.getPixelRatio();
    el.width = pixelRatio * width;
    el.height = pixelRatio * height;
    // 设置 canvas 元素的宽度和高度，会重置缩放，因此 context.scale 需要在每次设置宽、高后调用
    if (pixelRatio > 1) {
      context.scale(pixelRatio, pixelRatio);
    }
  }

  // 复写基类方法
  clear() {
    super.clear();
    this._clearFrame(); // 需要清理掉延迟绘制的帧
    const context = this.get('context');
    context.clearRect(0, 0, this.get('width'), this.get('height'));
  }

  getShape(x: number, y: number) {
    let shape;
    if (this.get('quickHit')) {
      shape = getShape(this, x, y);
    } else {
      shape = super.getShape(x, y, null);
    }
    return shape;
  }
  // 对绘制区域边缘取整，避免浮点数问题
  _getRefreshRegion() {
    const elements = this.get('refreshElements');
    const viewRegion = this.getViewRange();
    let region;
    // 如果是当前画布整体发生了变化，则直接重绘整个画布
    if (elements.length && elements[0] === this) {
      region = viewRegion;
    } else {
      region = getMergedRegion(elements);
      if (region) {
        region.minX = Math.floor(region.minX);
        region.minY = Math.floor(region.minY);
        region.maxX = Math.ceil(region.maxX);
        region.maxY = Math.ceil(region.maxY);
        region.maxY += 1; // 在很多环境下字体的高低会不一致，附加一像素，避免残影
        const clipView = this.get('clipView');
        // 自动裁剪不在 view 内的区域
        if (clipView) {
          region = mergeView(region, viewRegion);
        }
      }
    }
    return region;
  }

  // 清理还在进行的绘制
  _clearFrame() {
    const drawFrame = this.get('drawFrame');
    if (drawFrame) {
      // 如果全部渲染时，存在局部渲染，则抛弃掉局部渲染
      clearAnimationFrame(drawFrame);
      this.set('drawFrame', null);
      this.set('refreshElements', []);
    }
  }

  // 手工调用绘制接口
  draw() {
    const drawFrame = this.get('drawFrame');
    if (this.get('autoDraw') && drawFrame) {
      return;
    }
    this._startDraw();
  }

  // 触发绘制
  _startDraw() {
    let drawFrame = this.get('drawFrame');
    if (!drawFrame) {
      drawFrame = requestAnimationFrame(() => {
        if (this.get('localRefresh')) {
          this._drawRegion();
        } else {
          this._drawAll();
        }
        // 可能存在setInterval的情况
        clearAnimationFrame(drawFrame);
        this.set('drawFrame', null);
      });
      this.set('drawFrame', drawFrame);
    }
  }

  // 绘制局部
  _drawRegion() {
    const context = this.get('context');
    const refreshElements = this.get('refreshElements');
    const children = this.getChildren() as IElement[];
    const region = this._getRefreshRegion();
    // 需要注意可能没有 region 的场景
    // 一般发生在设置了 localRefresh ,在没有图形发生变化的情况下，用户调用了 draw
    if (region) {
      // 清理指定区域
      context.clearRect(region.minX, region.minY, region.maxX - region.minX, region.maxY - region.minY);
      // 保存上下文，设置 clip
      context.save();
      context.beginPath();
      context.rect(region.minX, region.minY, region.maxX - region.minX, region.maxY - region.minY);
      context.clip();
      applyAttrsToContext(context, this);
      // 确认更新的元素，这个优化可以提升 10 倍左右的性能，10W 个带有 group 的节点，局部渲染会从 90ms 下降到 5-6 ms
      checkRefresh(this, children, region);
      // 绘制子元素
      drawChildren(context, children, region);
      context.restore();
    } else if (refreshElements.length) {
      // 防止发生改变的 elements 没有 region 的场景，这会发生在多个情况下
      // 1. 空的 group
      // 2. 所有 elements 没有在绘图区域
      // 3. group 下面的 elements 隐藏掉
      // 如果不进行清理 hasChanged 的状态会不正确
      clearChanged(refreshElements);
    }
    each(refreshElements, (element) => {
      if (element.get('hasChanged')) {
        // 在视窗外的 Group 元素会加入到更新队列里，但实际却没有执行 draw() 逻辑，也就没有清除 hasChanged 标记
        // 即已经重绘完、但 hasChanged 标记没有清除的元素，需要统一清除掉。主要是 Group 存在问题，具体原因待排查
        element.set('hasChanged', false);
      }
    });
    // 针对小程序需要手动调用一次draw方法
    if (this.isMini() && !this.isMiniNative()) {
      context.draw(true);
    }
    this.set('refreshElements', []);
  }

  // 绘制所有图形
  _drawAll() {
    const context = this.get('context');
    const children = this.getChildren() as IElement[];
    context.clearRect(0, 0, this.get('width'), this.get('height'));
    applyAttrsToContext(context, this);
    drawChildren(context, children);
    // 针对小程序需要手动调用一次draw方法
    if (this.isMini() && !this.isMiniNative()) {
      context.draw(true);
    }

    // 对于 https://github.com/antvis/g/issues/422 的场景，全局渲染的模式下也会记录更新的元素队列，因此全局渲染完后也需要置空
    this.set('refreshElements', []);
  }

  skipDraw() {}

  /**
   * 刷新图形元素，这里仅仅是放入队列，下次绘制时进行绘制
   * @param {IElement} element 图形元素
   */
  refreshElement(element: IElement) {
    const refreshElements = this.get('refreshElements');
    refreshElements.push(element);
    // if (this.get('autoDraw')) {
    //   this._startDraw();
    // }
  }

  // 实现接口
  getPointByEvent(ev: Event): Point {
    if (this.isMini()) {
      const { x: clientX, y: clientY } = this.getClientByEvent(ev);
      return this.getPointByClient(clientX, clientY);
    }

    return super.getPointByEvent(ev);
  }

  // 获取 touch 事件的 clientX 和 clientY 需要单独处理
  getClientByEvent(event: any): any {
    // 这里需要转换成原始event
    const ev: Event = event.srcEvent;

    let clientInfo = null;
    if ((ev as TouchEvent).touches) {
      if (ev.type === 'touchend') {
        clientInfo = (ev as TouchEvent).changedTouches[0];
      } else {
        clientInfo = (ev as TouchEvent).touches[0];
      }
    }
    if (!clientInfo) {
      return {};
    }
    return {
      x: clientInfo.clientX,
      y: clientInfo.clientY,
    };
  }

  // 实现接口
  getPointByClient(clientX: number, clientY: number): Point {
    if (this.isMini()) {
      const rect = this.get('boundingClientRect');
      return {
        x: clientX + rect.left,
        y: clientY + rect.top,
      };
    }

    const el = this.get('el');
    const bbox = el.getBoundingClientRect();
    return {
      x: clientX - bbox.left,
      y: clientY - bbox.top,
    };
  }

  removeDom() {
    if (!this.isMini()) {
      super.removeDom();
    }
  }

  // 实现接口
  getClientByPoint(x: number, y: number): Point {
    if (this.isMini()) {
      // 小程序内需计算处理canvas的位置信息
      const rect = this.get('boundingClientRect');
      return {
        x: x + rect.left,
        y: y + rect.top,
      };
    }
    const el = this.get('el');
    const bbox = el.getBoundingClientRect();
    return {
      x: x + bbox.left,
      y: y + bbox.top,
    };
  }
}

export default Canvas;
