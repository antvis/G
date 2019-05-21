import { IElement, IShape, IGroup, ICtor } from '../interfaces';
import { GroupCfg, ShapeCfg } from '../types';
import Element from './element';
import ContainerUtil from '../util/container';

abstract class AbstractGroup extends Element implements IGroup {

  isGroup() {
    return true;
  }

  isCanvas() {
    return false;
  }

  clone() {
    const children = this.getChildren();
    // 获取构造函数
    const cons = this.constructor();
    const clone = new cons();
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

  addShape(type: string, cfg: ShapeCfg): IShape {
    return ContainerUtil.addShape(this, type, cfg);
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
