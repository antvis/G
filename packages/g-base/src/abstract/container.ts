import { IBase, IContainer, IShape, IGroup, IElement, ICanvas } from '../interfaces';
import { BBox } from '../types';
import Timeline from '../animate/timeline';
import Element from './element';
import { isFunction, isObject, each, removeFromArray, upperFirst } from '../util/util';

const SHAPE_MAP = {};
const INDEX = '_INDEX';

function afterAdd(element: IElement) {
  if (element.isGroup()) {
    if ((element as IGroup).isEntityGroup() || element.get('children').length) {
      element.onCanvasChange('add');
    }
  } else {
    element.onCanvasChange('add');
  }
}

/**
 * 设置 canvas
 * @param {IElement} element 元素
 * @param {ICanvas}  canvas  画布
 */
function setCanvas(element: IElement, canvas: ICanvas) {
  element.set('canvas', canvas);
  if (element.isGroup()) {
    const children = element.get('children');
    if (children.length) {
      children.forEach((child) => {
        setCanvas(child, canvas);
      });
    }
  }
}

/**
 * 设置 timeline
 * @param {IElement} element  元素
 * @param {Timeline} timeline 时间轴
 */
function setTimeline(element: IElement, timeline: Timeline) {
  element.set('timeline', timeline);
  if (element.isGroup()) {
    const children = element.get('children');
    if (children.length) {
      children.forEach((child) => {
        setTimeline(child, timeline);
      });
    }
  }
}

function contains(container: IContainer, element: IElement): boolean {
  const children = container.getChildren();
  return children.indexOf(element) >= 0;
}

function removeChild(container: IContainer, element: IElement, destroy: boolean = true) {
  // 不再调用 element.remove() 方法，会出现循环调用
  if (destroy) {
    element.destroy();
  } else {
    element.set('parent', null);
    element.set('canvas', null);
  }
  removeFromArray(container.getChildren(), element);
}

function getComparer(compare: Function) {
  return function(left, right) {
    const result = compare(left, right);
    return result === 0 ? left[INDEX] - right[INDEX] : result;
  };
}

function isAllowCapture(element: IBase): boolean {
  return element.get('visible') && element.get('capture');
}

abstract class Container extends Element implements IContainer {
  isCanvas() {
    return false;
  }

  // 根据子节点确定 BBox
  getBBox(): BBox {
    // 所有的值可能在画布的可视区外
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    const children = this.getChildren();
    if (children.length > 0) {
      each(children, (child: IElement) => {
        if (child.get('visible')) {
          // 如果分组没有子元素，则直接跳过
          if (child.isGroup() && child.get('children').length === 0) {
            return true;
          }
          const box = child.getBBox();
          // 计算 4 个顶点
          const leftTop = child.applyToMatrix([box.minX, box.minY, 1]);
          const leftBottom = child.applyToMatrix([box.minX, box.maxY, 1]);
          const rightTop = child.applyToMatrix([box.maxX, box.minY, 1]);
          const rightBottom = child.applyToMatrix([box.maxX, box.maxY, 1]);
          // 从中取最小的范围
          const boxMinX = Math.min(leftTop[0], leftBottom[0], rightTop[0], rightBottom[0]);
          const boxMaxX = Math.max(leftTop[0], leftBottom[0], rightTop[0], rightBottom[0]);
          const boxMinY = Math.min(leftTop[1], leftBottom[1], rightTop[1], rightBottom[1]);
          const boxMaxY = Math.max(leftTop[1], leftBottom[1], rightTop[1], rightBottom[1]);

          if (boxMinX < minX) {
            minX = boxMinX;
          }

          if (boxMaxX > maxX) {
            maxX = boxMaxX;
          }

          if (boxMinY < minY) {
            minY = boxMinY;
          }

          if (boxMaxY > maxY) {
            maxY = boxMaxY;
          }
        }
      });
    } else {
      minX = 0;
      maxX = 0;
      minY = 0;
      maxY = 0;
    }
    const box = {
      x: minX,
      y: minY,
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
    };
    return box;
  }

  // 获取画布的包围盒
  getCanvasBBox(): BBox {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    const xArr = [];
    const yArr = [];
    const children = this.getChildren();
    if (children.length > 0) {
      each(children, (child: IElement) => {
        if (child.get('visible')) {
          // 如果分组没有子元素，则直接跳过
          if (child.isGroup() && child.get('children').length === 0) {
            return true;
          }
          const box = child.getCanvasBBox();
          xArr.push(box.minX, box.maxX);
          yArr.push(box.minY, box.maxY);
        }
      });
      minX = Math.min.apply(null, xArr);
      maxX = Math.max.apply(null, xArr);
      minY = Math.min.apply(null, yArr);
      maxY = Math.max.apply(null, yArr);
    } else {
      minX = 0;
      maxX = 0;
      minY = 0;
      maxY = 0;
    }
    const box = {
      x: minX,
      y: minY,
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
    };
    return box;
  }

  getDefaultCfg() {
    const cfg = super.getDefaultCfg();
    cfg['children'] = [];
    return cfg;
  }

  // 兼容老版本的接口
  addShape(...args): IShape {
    const type = args[0];
    let cfg = args[1];
    if (isObject(type)) {
      cfg = type;
    } else {
      cfg['type'] = type;
    }
    let shapeType = SHAPE_MAP[cfg.type];
    if (!shapeType) {
      shapeType = upperFirst(cfg.type);
      SHAPE_MAP[cfg.type] = shapeType;
    }
    const ShapeBase = this.getShapeBase();
    const shape = new ShapeBase[shapeType](cfg);
    this.add(shape);
    return shape;
  }

  addGroup(...args): IGroup {
    const [groupClass, cfg] = args;
    let group;
    if (isFunction(groupClass)) {
      if (cfg) {
        group = new groupClass(cfg);
      } else {
        group = new groupClass({
          // canvas,
          parent: this,
        });
      }
    } else {
      const tmpCfg = groupClass || {};
      const TmpGroupClass = this.getGroupBase();
      group = new TmpGroupClass(tmpCfg);
    }
    this.add(group);
    return group;
  }

  getCanvas() {
    let canvas;
    if (this.isCanvas()) {
      canvas = this;
    } else {
      canvas = this.get('canvas');
    }
    return canvas;
  }

  getShape(x: number, y: number): IShape {
    // 如果不支持拾取，则直接返回
    if (!isAllowCapture(this)) {
      return null;
    }
    const children = this.getChildren();
    let shape;
    // 如果容器是 group
    if (!this.isCanvas()) {
      let v = [x, y, 1];
      // 将 x, y 转换成对应于 group 的局部坐标
      v = this.invertFromMatrix(v);
      if (!this.isClipped(v[0], v[1])) {
        shape = this._findShape(children, v[0], v[1]);
      }
    } else {
      shape = this._findShape(children, x, y);
    }
    return shape;
  }

  _findShape(children: IElement[], x: number, y: number) {
    let shape = null;
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      if (isAllowCapture(child)) {
        if (child.isGroup()) {
          shape = (child as IGroup).getShape(x, y);
        } else if ((child as IShape).isHit(x, y)) {
          shape = child;
        }
      }
      if (shape) {
        break;
      }
    }
    return shape;
  }

  add(element: IElement) {
    const canvas = this.getCanvas();
    const children = this.getChildren();
    const timeline = this.get('timeline');
    const preParent = element.getParent();
    if (preParent) {
      removeChild(preParent, element, false);
    }
    element.set('parent', this);
    if (canvas) {
      setCanvas(element, canvas);
    }
    if (timeline) {
      setTimeline(element, timeline);
    }
    children.push(element);
    afterAdd(element);
    this._applyElementMatrix(element);
  }

  // 将当前容器的矩阵应用到子元素
  _applyElementMatrix(element) {
    const totalMatrix = this.getTotalMatrix();
    // 添加图形或者分组时，需要把当前图元的矩阵设置进去
    if (totalMatrix) {
      element.applyMatrix(totalMatrix);
    }
  }

  getChildren(): IElement[] {
    return this.get('children') as IElement[];
  }

  sort() {
    const children = this.getChildren();
    // 稳定排序
    each(children, (child, index) => {
      child[INDEX] = index;
      return child;
    });
    children.sort(
      getComparer((obj1, obj2) => {
        return obj1.get('zIndex') - obj2.get('zIndex');
      })
    );
    this.onCanvasChange('sort');
  }

  clear() {
    this.set('clearing', true);
    if (this.destroyed) {
      return;
    }
    const children = this.getChildren();
    for (let i = children.length - 1; i >= 0; i--) {
      children[i].destroy(); // 销毁子元素
    }
    this.set('children', []);
    this.onCanvasChange('clear');
    this.set('clearing', false);
  }

  destroy() {
    if (this.get('destroyed')) {
      return;
    }
    this.clear();
    super.destroy();
  }
}

export default Container;
