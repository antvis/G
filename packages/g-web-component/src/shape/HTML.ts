import { HTML, HTMLStyleProps } from "@antv/g";
import { BaseShape } from "./BaseShape";

export class HTMLShape extends BaseShape {
  connectedCallback(): void {
    super.connectedCallback();
    const observer = new MutationObserver(() => {
      const egl = this.gElement as any;
      const targetEl = egl?.getDomElement();
      if (targetEl) {
        targetEl.innerHTML = this.innerHTML;
      }
    });
    observer.observe(this, {
      characterData: true,
      childList: true,
      characterDataOldValue: true,
    });
  }
  getElementInstance() {
    const shape = new HTML({
      style: {
        innerHTML: "<div></div>",
        ...this.getAttrsData(),
      } as HTMLStyleProps,
    });
    return shape;
  }
}
