import Base from './base';
import { IElement, IShape, IGroup, ICanvas, IContainer, ICtor } from '../interfaces';
import { ShapeCfg } from '../types';
import ContainerUtil from '../util/container';

abstract class Canvas extends Base implements ICanvas, IContainer{

  /**
   * @protected
   * 修改画布对应的 DOM 的大小
   * @param {number} width  宽度
   * @param {number} height 高度
   */
  changeDOMSize(width: number, height: number) {

  }

  // 实现接口
  changeSize(width: number, height: number) {
    this.changeDOMSize(width, height);
    this.set('width', width);
    this.set('height', height);
  }

  // 实现接口
  getPointByClient(clientX: number, clientY: number): object {
    const el = this.get('el');
    const bbox = el.getBoundingClientRect();
    return {
      x: clientX - bbox.left,
      y: clientY - bbox.top,
    };
  }

  // 实现接口
  getClientByPoint(x: number, y: number): object {
    const el = this.get('el');
    const bbox = el.getBoundingClientRect();
    return {
      clientX: x + bbox.left,
      clientY: y + bbox.top,
    };
  }

  // 实现接口
  draw() {

  }

  // 继承自 IContainer 的方法，由于 ts 的 mixin 非常复杂
  // 所以 canvas 和 group 中的代码重复
  // 但是具体实现都已经提取到 util/container 中

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
    return this.get('children');
  }

  sort() {
    ContainerUtil.sort(this);
  }

  clear() {
    ContainerUtil.clear(this);
  }
}
