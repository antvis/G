import type { DisplayObjectConfig } from '@antv/g';
import { CustomElement, Circle } from '../../../lib';

interface AProps {
  size: number;
}

describe('CustomElement', () => {
  it('create custom element', () => {
    class ElementA extends CustomElement<AProps> {
      constructor(options: DisplayObjectConfig<AProps>) {
        super(options);
        // this.addEventListener('onclick', () => {});
        const circle = new Circle({ style: { r: options.style?.size || 0 } });
        this.appendChild(circle);
      }
      connectedCallback = () => {
        throw new Error('Method not implemented.');
      };
      disconnectedCallback = () => {
        throw new Error('Method not implemented.');
      };
      attributeChangedCallback = <Key extends never>(
        name: Key,
        oldValue: {}[Key],
        newValue: {}[Key],
      ) => {
        throw new Error('Method not implemented.');
      };
    }
    const a = new ElementA({ style: { size: 10 } });
    expect(a.style.size).toBe(10);
    a.setAttribute('size', 20);
    expect(a.style.size).toBe(20);
  });
});
