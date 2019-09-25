import { IGroup } from '../interfaces';
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
}

export default AbstractGroup;
