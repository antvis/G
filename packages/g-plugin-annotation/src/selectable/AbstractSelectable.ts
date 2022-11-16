import type { Circle, DisplayObject, DisplayObjectConfig } from '@antv/g-lite';
import { CustomElement } from '@antv/g-lite';
import type { SelectablePlugin } from '../SelectablePlugin';
import type { Selectable, SelectableProps } from './interface';

export abstract class AbstractSelectable<MaskType extends DisplayObject>
  extends CustomElement<SelectableProps>
  implements Selectable
{
  /**
   * Transparent mask
   */
  mask: MaskType;

  /**
   * Anchors
   */
  anchors: Circle[] = [];

  /**
   * Ref to plugin
   */
  plugin: SelectablePlugin;

  abstract init(): void;

  abstract destroy(): void;

  abstract moveMask(dx: number, dy: number): void;

  abstract triggerMovingEvent(dx: number, dy: number): void;

  abstract triggerMovedEvent(): void;

  constructor({
    style,
    ...rest
  }: Partial<DisplayObjectConfig<SelectableProps>>) {
    super({
      style: {
        selectionFill: 'transparent',
        selectionFillOpacity: 1,
        selectionStroke: 'black',
        selectionStrokeOpacity: 1,
        selectionStrokeWidth: 1,
        selectionLineDash: 0,
        anchorFill: 'black',
        anchorStroke: 'black',
        anchorStrokeOpacity: 1,
        anchorStrokeWidth: 1,
        anchorFillOpacity: 1,
        anchorSize: 6,
        ...style,
      },
      ...rest,
    });
  }

  connectedCallback() {
    this.init();
  }

  disconnectedCallback() {
    this.destroy();
  }

  attributeChangedCallback<Key extends never>(
    name: Key,
    oldValue: Record<string, any>[Key],
    newValue: Record<string, any>[Key],
  ) {
    if (name === 'selectionStroke') {
      this.mask.style.stroke = newValue;
    } else if (name === 'selectionFill') {
      this.mask.style.fill = newValue;
    } else if (name === 'selectionFillOpacity') {
      this.mask.style.fillOpacity = newValue;
    } else if (name === 'selectionStrokeOpacity') {
      this.mask.style.strokeOpacity = newValue;
    } else if (name === 'selectionStrokeWidth') {
      this.mask.style.lineWidth = newValue;
    } else if (name === 'selectionLineDash') {
      this.mask.style.lineDash = newValue;
    } else if (name === 'anchorFill') {
      this.anchors.forEach((anchor) => {
        anchor.style.fill = newValue;
      });
    } else if (name === 'anchorStrokeWidth') {
      this.anchors.forEach((anchor) => {
        anchor.style.strokeWidth = newValue;
      });
    } else if (name === 'anchorStroke') {
      this.anchors.forEach((anchor) => {
        anchor.style.stroke = newValue;
      });
    } else if (name === 'anchorSize') {
      this.anchors.forEach((anchor) => {
        anchor.style.r = newValue;
      });
    } else if (name === 'anchorStrokeOpacity') {
      this.anchors.forEach((anchor) => {
        anchor.style.strokeOpacity = newValue;
      });
    } else if (name === 'anchorFillOpacity') {
      this.anchors.forEach((anchor) => {
        anchor.style.fillOpacity = newValue;
      });
    }
  }
}
