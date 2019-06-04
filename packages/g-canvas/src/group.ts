import { AbstractGroup }  from '@antv/g-base';

import Shape from './shape/index';
import { each } from '@antv/util';
import { applyAttrsToContext, drawChildren } from './util/draw';

class Group extends AbstractGroup {

  getShapeBase() {
    return Shape;
  }

  getGroupBase() {
    return Group;
  }

  // 同 shape 中的方法重复了
  _applyClip(context, clip: Shape) {
    if (clip) {
      clip.createPath(context);
      context.clip();
    }
  }

  draw(context) {
    const children = this.getChildren();
    if (children.length) {
      context.save();
      this._applyClip(context, this.getClip() as Shape);
      // group 上的矩阵和属性也会应用到上下文上
      applyAttrsToContext(context, this);
      drawChildren(context, children);
      context.restore();
    }
  }
}

export default Group;
