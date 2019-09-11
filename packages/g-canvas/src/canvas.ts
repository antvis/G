import { AbstractCanvas } from '@antv/g-base';
import { IElement } from '@antv/g-base/lib/interfaces';
import { ChangeType } from '@antv/g-base/lib/types';
import { Region } from './types';
import EventController from '@antv/g-base/lib/event/event-contoller';
import Shape from './shape';
import Group from './group';
import { drawChildren, getRefreshRegion } from './util/draw';
import { getPixelRatio, each, mergeRegion, requestAnimationFrame, clearAnimationFrame } from './util/util';
const REFRSH_COUNT = 30; // 局部刷新的元素个数，超过后合并绘图区域

function getMergedRegion(elements): Region {
  if (!elements.length) {
    return null;
  }
  const minXArr = [];
  const minYArr = [];
  const maxXArr = [];
  const maxYArr = [];
  each(elements, (el: IElement) => {
    const region = getRefreshRegion(el);
    if (region) {
      minXArr.push(region.minX);
      minYArr.push(region.minY);
      maxXArr.push(region.maxX);
      maxYArr.push(region.maxY);
    }
  });
  return {
    minX: Math.min.apply(null, minXArr),
    minY: Math.min.apply(null, minYArr),
    maxX: Math.max.apply(null, maxXArr),
    maxY: Math.max.apply(null, maxYArr),
  };
}

class Canvas extends AbstractCanvas {
  getDefaultCfg() {
    const cfg = super.getDefaultCfg();
    // 是否自动绘制，不需要用户调用 draw 方法
    cfg['autoDraw'] = false;
    // 是否允许局部刷新图表
    cfg['localRefresh'] = true;
    cfg['refreshElements'] = [];
    return cfg;
  }

  /**
   * 一些方法调用会引起画布变化
   * @param {ChangeType} changeType 改变的类型
   */
  onCanvasChange(changeType: ChangeType) {
    // 排序时图形的层次发生变化，
    // 画布大小改变可能也会引起变化
    if (changeType === 'sort' || changeType === 'changeSize') {
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
    return this.get('pixelRatio') || getPixelRatio();
  }

  getViewRange() {
    const element = this.get('el');
    return {
      minX: 0,
      minY: 0,
      maxX: element.width,
      maxY: element.height,
    };
  }

  // 复写处理事件
  initEvents() {
    const eventController = new EventController({
      canvas: this,
    });
    eventController.init();
    this.set('eventController', eventController);
  }

  // 复写基类的方法生成标签
  createDom(): HTMLElement {
    const element = document.createElement('canvas');
    const pixelRatio = this.getPixelRatio();
    const context = element.getContext('2d');
    element.width = pixelRatio * this.get('width');
    element.height = pixelRatio * this.get('height');
    if (pixelRatio > 1) {
      context.scale(pixelRatio, pixelRatio);
    }
    // 缓存 context 对象
    this.set('context', context);
    return element;
  }
  setDOMSize(width: number, height: number) {
    super.setDOMSize(width, height);
    const el = this.get('el');
    const pixelRatio = this.getPixelRatio();
    el.width = pixelRatio * width;
    el.height = pixelRatio * height;
  }
  // 复写基类方法
  clear() {
    super.clear();
    this._clearFrame(); // 需要清理掉延迟绘制的帧
    const context = this.get('context');
    const element = this.get('el');
    context.clearRect(0, 0, element.width, element.height);
  }

  // 对绘制区域边缘取整，避免浮点数问题
  _getRefreshRegion() {
    const elements = this.get('refreshElements');
    let region;
    // 如果是当前画布整体发生了变化，则直接重绘整个画布
    if (elements.length && elements[0] === this) {
      region = this.getViewRange();
    } else {
      region = getMergedRegion(elements);
      if (region) {
        region.minX = Math.floor(region.minX);
        region.minY = Math.floor(region.minY);
        region.maxX = Math.ceil(region.maxX);
        region.maxY = Math.ceil(region.maxY);
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
    const children = this.getChildren();
    context.clearRect(0, 0, element.width, element.height);
    drawChildren(context, children);
  }
  // 绘制局部
  _drawRegion() {
    const context = this.get('context');
    const children = this.getChildren();
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
      // 绘制子元素
      drawChildren(context, children, region);
      context.restore();
    }
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

  destroy() {
    const eventController = this.get('eventController');
    eventController.destroy();
    super.destroy();
  }
}

export default Canvas;
