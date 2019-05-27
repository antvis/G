import { IElement, IShape, IGroup, ICtor } from '../interfaces';
import { GroupCfg, ShapeCfg } from '../types';
import Element from './element';
import ContainerUtil from '../util/container';
import { isObject } from '@antv/util';

abstract class AbstractGroup extends Element implements IGroup {

  isGroup() {
    return true;
  }

  isCanvas() {
    return false;
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

  addGroup(...args):IGroup {
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
