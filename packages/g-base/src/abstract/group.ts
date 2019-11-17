import { IElement, IGroup } from '../interfaces';
import { ElementFilterFn } from '../types';
import Container from './container';
import { each } from '../util/util';

abstract class AbstractGroup extends Container implements IGroup {
  isGroup() {
    return true;
  }

  isEntityGroup() {
    return false;
  }

  onAttrChange(name, value, originValue) {
    super.onAttrChange(name, value, originValue);
    if (name === 'matrix') {
      const totalMatrix = this.getTotalMatrix();
      this._applyChildrenMarix(totalMatrix);
    }
  }

  // 不但应用到自己身上还要应用于子元素
  applyMatrix(matrix: number[]) {
    const preTotalMatrix = this.getTotalMatrix();
    super.applyMatrix(matrix);
    const totalMatrix = this.getTotalMatrix();
    // totalMatrix 没有发生变化时，这里仅考虑两者都为 null 时
    // 不继续向下传递矩阵
    if (totalMatrix === preTotalMatrix) {
      return;
    }
    this._applyChildrenMarix(totalMatrix);
  }
  // 在子元素上设置矩阵
  _applyChildrenMarix(totalMatrix) {
    const children = this.getChildren();
    each(children, (child) => {
      child.applyMatrix(totalMatrix);
    });
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

  /**
   * 获取 Group 的第一个子元素
   * @return {IElement} 第一个元素
   */
  getFirst(): IElement {
    const children = this.getChildren();
    return children[0];
  }

  /**
   * 获取 Group 的最后一个子元素
   * @return {IElement} 元素
   */
  getLast(): IElement {
    const children = this.getChildren();
    return children[children.length - 1];
  }

  /**
   * 子元素的数量
   * @return {number} 子元素数量
   */
  getCount(): number {
    const children = this.getChildren();
    return children.length;
  }

  /**
   * 查找所有匹配的元素
   * @param  {ElementFilterFn}   fn  匹配函数
   * @return {IElement[]} 元素数组
   */
  findAll(fn: ElementFilterFn): IElement[] {
    let rst: IElement[] = [];
    const children = this.getChildren();
    each(children, (element: IElement) => {
      if (fn(element)) {
        rst.push(element);
      }
      if (element.isGroup()) {
        rst = rst.concat((element as IGroup).findAll(fn));
      }
    });
    return rst;
  }

  /**
   * 根据 ID 查找元素
   * @param {string} id 元素 id
   * @return {IElement|null} 元素
   */
  findById(id: string): IElement {
    return this.find((element) => {
      return element.get('id') === id;
    });
  }

  /**
   * 查找元素，找到第一个返回
   * @param  {ElementFilterFn} fn    匹配函数
   * @return {IElement|null} 元素，可以为空
   */
  find(fn: ElementFilterFn): IElement {
    let rst: IElement = null;
    const children = this.getChildren();
    each(children, (element: IElement) => {
      if (fn(element)) {
        rst = element;
      } else if (element.isGroup()) {
        rst = (element as IGroup).find(fn);
      }
      if (rst) {
        return false;
      }
    });
    return rst;
  }
}

export default AbstractGroup;
