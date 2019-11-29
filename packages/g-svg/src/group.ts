import { AbstractGroup } from '@antv/g-base';
import { ChangeType } from '@antv/g-base/lib/types';
import { each } from '@antv/util';
import { IElement, IGroup } from './interfaces';
import * as Shape from './shape';
import Defs from './defs';
import { drawChildren, applyClipChildren, drawPathChildren, refreshElement } from './util/draw';
import { setClip } from './util/svg';
import { SVG_ATTR_MAP } from './constant';

class Group extends AbstractGroup {
  // SVG 中分组对应实体标签 <g>
  isEntityGroup() {
    return true;
  }

  createDom() {
    const element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.set('el', element);
    const parent = this.getParent();
    if (parent) {
      let parentNode = parent.get('el');
      if (parentNode) {
        parentNode.appendChild(element);
      } else {
        // parentNode maybe null for group
        parentNode = (parent as IGroup).createDom();
        parent.set('el', parentNode);
        parentNode.appendChild(element);
      }
    }
    return element;
  }

  // 覆盖基类的 afterAttrsChange 方法
  afterAttrsChange(targetAttrs) {
    super.afterAttrsChange(targetAttrs);
    const canvas = this.get('canvas');
    // 只有挂载到画布下，才对元素进行实际渲染
    if (canvas) {
      const context = canvas.get('context');
      this.updatePath(context, targetAttrs);
    }
  }

  /**
   * 一些方法调用会引起画布变化
   * @param {ChangeType} changeType 改变的类型
   */
  onCanvasChange(changeType: ChangeType) {
    refreshElement(this, changeType);
  }

  getShapeBase() {
    return Shape;
  }

  getGroupBase() {
    return Group;
  }

  draw(context: Defs) {
    const children = this.getChildren() as IElement[];
    setClip(this, context);
    this.createDom();
    this.updatePath(context);
    if (children.length) {
      drawChildren(context, children);
    }
  }

  applyClip(context: Defs) {
    const children = this.getChildren() as IElement[];
    setClip(this, context);
    if (children.length) {
      applyClipChildren(context, children);
    }
  }

  drawPath(context: Defs) {
    const children = this.getChildren() as IElement[];
    this.createDom();
    this.updatePath(context);
    if (children.length) {
      drawPathChildren(context, children);
    }
  }

  updatePath(context: Defs, targetAttrs?) {
    const attrs = this.attr();
    const el = this.get('el');
    each(targetAttrs || attrs, (value, attr) => {
      if (SVG_ATTR_MAP[attr]) {
        el.setAttribute(SVG_ATTR_MAP[attr], value);
      }
    });
  }
}

export default Group;
