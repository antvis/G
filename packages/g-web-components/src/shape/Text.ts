import type { TextStyleProps } from '@antv/g-lite';
import { Text } from '@antv/g-lite';
import { BaseShape } from './BaseShape';

export class TextShape extends BaseShape {
  connectedCallback(): void {
    super.connectedCallback();
    const observer = new MutationObserver(() => {
      this.gElement?.setAttribute('text', this.innerText);
    });
    observer.observe(this, {
      characterData: true,
      childList: true,
      characterDataOldValue: true,
    });
  }

  getElementInstance() {
    const style = this.getAttrsData() as TextStyleProps;
    style.text = this.innerText;
    const shape = new Text({
      style: {
        textBaseline: 'hanging',

        ...style,
      },
    });
    return shape;
  }
}
