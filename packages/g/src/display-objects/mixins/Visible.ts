import { Element } from '../../dom';
import { Cullable } from '../../components';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../../types';

export class Visible<
  StyleProps extends BaseStyleProps = any,
  ParsedStyleProps extends ParsedBaseStyleProps = any,
> extends Element<StyleProps, ParsedStyleProps> {
  /**
   * show group, which will also change visibility of its children in sceneGraphNode
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/CSS/visibility
   */
  show() {
    this.style.visibility = 'visible';
  }

  /**
   * hide group, which will also change visibility of its children in sceneGraphNode
   */
  hide() {
    this.style.visibility = 'hidden';
  }

  isVisible() {
    const cullable = this.entity.getComponent(Cullable);
    return this.style.visibility === 'visible' && (!cullable || (cullable && !cullable.isCulled()));
  }

  /**
   * bring to front in current group
   */
  toFront() {
    if (this.parentNode) {
      this.style.zIndex =
        Math.max(...this.parentNode.children.map((child) => Number(child.style.zIndex))) + 1;
    }
    return this;
  }

  /**
   * send to back in current group
   */
  toBack() {
    if (this.parentNode) {
      this.style.zIndex =
        Math.min(...this.parentNode.children.map((child) => Number(child.style.zIndex))) - 1;
    }
    return this;
  }
}
