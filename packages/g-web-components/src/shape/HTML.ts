import type { HTMLStyleProps } from '@antv/g-lite';
import { HTML } from '@antv/g-lite';
import { BaseShape } from './BaseShape';

export class HTMLShape extends BaseShape {
  connectedCallback(): void {
    super.connectedCallback();

    function updateHTML(shape: HTMLShape) {
      const egl = shape.gElement as any;
      const targetEl = egl?.getDomElement();
      if (targetEl) {
        targetEl.innerHTML = shape.innerHTML;
      }
    }

    const observer = new MutationObserver(() => {
      updateHTML(this);
    });
    observer.observe(this, {
      characterData: true,
      childList: true,
      characterDataOldValue: true,
    });

    updateHTML(this);
  }
  getElementInstance() {
    const shape = new HTML({
      style: {
        innerHTML: '<div></div>',
        ...this.getAttrsData(),
      } as HTMLStyleProps,
    });
    return shape;
  }
}
