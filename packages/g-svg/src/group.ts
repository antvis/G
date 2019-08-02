import { AbstractGroup } from '@antv/g-base';
import Shape from './shape';
import { drawChildren } from './util/draw';
import { setClip } from './util/svg';

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
      setClip(this, context);
    }
  }

  draw(context) {
    const children = this.getChildren();
    if (children.length) {
      this._applyClip(context, this.getClip() as Shape);
      drawChildren(context, children);
    }
  }
}

export default Group;
