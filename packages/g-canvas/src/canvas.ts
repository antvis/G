import { AbstractCanvas } from '@antv/g-base';
import { ChangeType } from '@antv/g-base/lib/types';
import { IElement } from './interfaces';
import { getShape } from './util/hit';
import * as Shape from './shape';
import Group from './group';
import { applyAttrsToContext, drawChildren, getMergedRegion, mergeView } from './util/draw';
import { each, getPixelRatio, requestAnimationFrame, clearAnimationFrame } from './util/util';

class Canvas extends AbstractCanvas {
  getDefaultCfg() {
    const cfg = super.getDefaultCfg();
    // 设置渲染引擎为 canvas，只读属性
    cfg['renderer'] = 'canvas';
    // 是否自动绘制，不需要用户调用 draw 方法
    cfg['autoDraw'] = true;
    // 是否允许局部刷新图表
    cfg['localRefresh'] = true;
    cfg['refreshElements'] = [];
    // 是否在视图内自动裁剪
    cfg['clipView'] = true;
    cfg['quickHit'] = false;
    return cfg;
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
      maxX: this.get('width'),
      maxY: this.get('height'),
    };
  }

  // 复写基类的方法生成标签
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
    const element = this.get('el');
    context.clearRect(0, 0, element.width, element.height);
  }

  getShape(x: number, y: number) {
    if (this.get('quickHit')) {
      return getShape(this, x, y);
    }
    return super.getShape(x, y, null);
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
        const clipView = this.get('clipView');
        // 自动裁剪不在 view 内的区域
        if (clipView) {
          region = mergeView(region, viewRegion);
        }
      }
    }
    return region;
  }

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
  // 绘制所有图形
  _drawAll() {
    const context = this.get('context');
    const element = this.get('el');
    const children = this.getChildren() as IElement[];
    context.clearRect(0, 0, element.width, element.height);
    applyAttrsToContext(context, this);
    drawChildren(context, children);
    // 对于 https://github.com/antvis/g/issues/422 的场景，全局渲染的模式下也会记录更新的元素队列，因此全局渲染完后也需要置空
    this.set('refreshElements', []);
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
      // 绘制子元素
      drawChildren(context, children, region);
      context.restore();
    }
    each(refreshElements, (element) => {
      if (element.get('hasChanged')) {
        // 在视窗外的 Group 元素会加入到更新队列里，但实际却没有执行 draw() 逻辑，也就没有清除 hasChanged 标记
        // 即已经重绘完、但 hasChanged 标记没有清除的元素，需要统一清除掉。主要是 Group 存在问题，具体原因待排查
        element.set('hasChanged', false);
      }
    });
    this.set('refreshElements', []);
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
        this.set('drawFrame', null);
      });
      this.set('drawFrame', drawFrame);
    }
  }

  skipDraw() {}
}

export default Canvas;
