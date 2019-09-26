import { IContainer, ICtor, IShape, IGroup, IElement } from '../interfaces';
import BBox from '../bbox';
import Element from './element';
import ContainerUtil from '../util/container';
import { isObject, each } from '../util/util';

function afterAdd(element: IElement) {
  if (element.isGroup()) {
    if ((element as IGroup).isEntityGroup() || element.get('children').length) {
      element.onCanvasChange('add');
    }
  } else {
    element.onCanvasChange('add');
  }
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
    return BBox.fromRange(minX, minY, maxX, maxY);
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
    return BBox.fromRange(minX, minY, maxX, maxY);
  }

  abstract getShapeBase(): ICtor<IShape>;
  abstract getGroupBase(): ICtor<IGroup>;

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
    const shape = ContainerUtil.addShape(this, cfg);
    // 调用 shape 的变化事件，而不是 container 的
    afterAdd(shape);
    this._applyElementMatrix(shape);
    return shape;
  }

  addGroup(...args): IGroup {
    const [groupClass, cfg] = args;
    const group = ContainerUtil.addGroup(this, groupClass, cfg);
    // Group maybe a real element
    afterAdd(group);
    this._applyElementMatrix(group);
    return group;
  }

  getShape(x: number, y: number): IShape {
    return ContainerUtil.getShape(this, x, y);
  }

  add(element: IElement) {
    ContainerUtil.add(this, element);
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
    ContainerUtil.sort(this);
    this.onCanvasChange('sort');
  }

  clear() {
    this.set('clearing', true);
    ContainerUtil.clear(this);
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
