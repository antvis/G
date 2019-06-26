import { IElement, IShape, IGroup, ICtor } from '../interfaces';
import { GroupCfg, ShapeCfg, BBox } from '../types';
import Element from './element';
import ContainerUtil from '../util/container';
import { isObject, each } from '@antv/util';

abstract class AbstractGroup extends Element implements IGroup {
  isGroup() {
    return true;
  }

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
          const leftTop = [ box.minX, box.minY, 1 ];
          const leftBottom = [ box.minX, box.maxY, 1 ];
          const rightTop = [ box.maxX, box.minY, 1 ];
          const rightBottom = [ box.maxX, box.maxY, 1 ];

          child.applyToMatrix(leftTop);
          child.applyToMatrix(leftBottom);
          child.applyToMatrix(rightTop);
          child.applyToMatrix(rightBottom);

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
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
    };
    return box;
  }

  clone() {
    const clone = super.clone();
    // 获取构造函数
    const children = this.getChildren();
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      clone.add(child.clone());
    }
    return clone;
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
    return ContainerUtil.addShape(this, cfg);
  }

  addGroup(...args): IGroup {
    const [ groupClass, cfg ] = args;
    return ContainerUtil.addGroup(this, groupClass, cfg);
  }

  getShape(x: number, y: number): IShape {
    return ContainerUtil.getShape(this, x, y);
  }

  add(element: IElement) {
    ContainerUtil.add(this, element);
  }

  getChildren(): IElement[] {
    return this.get('children') as IElement[];
  }

  sort() {
    ContainerUtil.sort(this);
  }

  clear() {
    ContainerUtil.clear(this);
  }

  destroy() {
    if (this.get('destroyed')) {
      return;
    }
    this.clear();
    super.destroy();
  }
}

export default AbstractGroup;
