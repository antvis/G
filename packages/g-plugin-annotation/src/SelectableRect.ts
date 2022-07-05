import {
  BaseCustomElementStyleProps,
  Circle,
  CustomElement,
  DisplayObject,
  DisplayObjectConfig,
  Rect,
} from '@antv/g';

interface Props extends BaseCustomElementStyleProps {
  target: DisplayObject;
  maskFill?: string;
  maskStroke?: string;
}

export class SelectableRect extends CustomElement<Props> {
  private target: DisplayObject;

  /**
   * transparent mask
   */
  private mask: Rect;

  private rotateAnchor: Circle;

  constructor(options: Partial<DisplayObjectConfig<Props>>) {
    super(options);

    this.target = options.style.target;

    this.mask = new Rect({
      style: {
        width: 0,
        height: 0,
        stroke: 'black',
        fill: 'rgba(0, 0, 0, 0.2)',
      },
    });
    this.appendChild(this.mask);
  }
  connectedCallback() {
    const { halfExtents } = this.target.getGeometryBounds();
    const transform = this.target.getWorldTransform();

    // resize according to target
    this.mask.style.width = halfExtents[0] * 2;
    this.mask.style.height = halfExtents[1] * 2;
    this.mask.setLocalTransform(transform);
  }
  disconnectedCallback() {}
  attributeChangedCallback<Key extends never>(name: Key, oldValue: {}[Key], newValue: {}[Key]) {}
}
