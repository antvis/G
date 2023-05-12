import type { Circle, DisplayObject, DisplayObjectConfig } from '@antv/g-lite';
import { CustomElement } from '@antv/g-lite';
import type { SelectablePlugin } from '../SelectablePlugin';
import type { Selectable, SelectableProps } from './interface';
import { SelectableStyle } from '../tokens';

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
   * Selected anchors which can be deleted with keypress.
   */
  selectedAnchors: Set<Circle> = new Set();

  /**
   * Potential added anchors.
   */
  midAnchors: Circle[] = [];

  /**
   * Ref to plugin
   */
  plugin: SelectablePlugin;

  private defaultAnchorStyle: Pick<
    SelectableStyle,
    | 'anchorFill'
    | 'anchorFillOpacity'
    | 'anchorSize'
    | 'anchorStroke'
    | 'anchorStrokeOpacity'
    | 'anchorStrokeWidth'
  >;
  private selectedAnchorStyle: Pick<
    SelectableStyle,
    | 'anchorFill'
    | 'anchorFillOpacity'
    | 'anchorSize'
    | 'anchorStroke'
    | 'anchorStrokeOpacity'
    | 'anchorStrokeWidth'
  >;

  abstract init(): void;

  abstract destroy(): void;

  abstract moveMask(dx: number, dy: number): void;

  abstract triggerMovingEvent(dx: number, dy: number): void;

  abstract triggerMovedEvent(): void;

  abstract deleteSelectedAnchors(): void;

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

    this.saveAnchorStyle();
  }

  private saveAnchorStyle() {
    this.defaultAnchorStyle = {
      anchorFill: this.style.anchorFill,
      anchorStroke: this.style.anchorStroke,
      anchorStrokeOpacity: this.style.anchorStrokeOpacity,
      anchorStrokeWidth: this.style.anchorStrokeWidth,
      anchorFillOpacity: this.style.anchorFillOpacity,
      anchorSize: this.style.anchorSize,
    };
    this.selectedAnchorStyle = {
      anchorFill: this.style.selectedAnchorFill ?? this.style.anchorFill,
      anchorStroke: this.style.selectedAnchorStroke ?? this.style.anchorStroke,
      anchorStrokeOpacity:
        this.style.selectedAnchorStrokeOpacity ??
        this.style.anchorStrokeOpacity,
      anchorStrokeWidth:
        this.style.selectedAnchorStrokeWidth ?? this.style.anchorStrokeWidth,
      anchorFillOpacity:
        this.style.selectedAnchorFillOpacity ?? this.style.anchorFillOpacity,
      anchorSize: this.style.selectedAnchorSize ?? this.style.anchorSize,
    };
  }

  selectAnchor(anchor: Circle) {
    this.selectedAnchors.add(anchor);
    const {
      anchorFill,
      anchorStroke,
      anchorStrokeOpacity,
      anchorStrokeWidth,
      anchorFillOpacity,
      anchorSize,
    } = this.selectedAnchorStyle;

    anchor.attr({
      fill: anchorFill,
      stroke: anchorStroke,
      strokeOpacity: anchorStrokeOpacity,
      strokeWidth: anchorStrokeWidth,
      fillOpacity: anchorFillOpacity,
      r: anchorSize,
    });
  }

  deselectAnchor(anchor: Circle) {
    this.selectedAnchors.delete(anchor);

    const {
      anchorFill,
      anchorStroke,
      anchorStrokeOpacity,
      anchorStrokeWidth,
      anchorFillOpacity,
      anchorSize,
    } = this.defaultAnchorStyle;

    anchor.attr({
      fill: anchorFill,
      stroke: anchorStroke,
      strokeOpacity: anchorStrokeOpacity,
      strokeWidth: anchorStrokeWidth,
      fillOpacity: anchorFillOpacity,
      r: anchorSize,
    });
  }

  protected bindAnchorEvent(anchor: Circle) {
    anchor.addEventListener('click', () => {
      if (this.selectedAnchors.has(anchor)) {
        this.deselectAnchor(anchor);
      } else {
        this.selectAnchor(anchor);
      }
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
    } else if (name === 'selectedAnchorFill') {
      this.selectedAnchors.forEach((anchor) => {
        anchor.style.fill = newValue;
      });
    } else if (name === 'selectedAnchorStrokeWidth') {
      this.selectedAnchors.forEach((anchor) => {
        anchor.style.strokeWidth = newValue;
      });
    } else if (name === 'selectedAnchorStroke') {
      this.selectedAnchors.forEach((anchor) => {
        anchor.style.stroke = newValue;
      });
    } else if (name === 'selectedAnchorSize') {
      this.selectedAnchors.forEach((anchor) => {
        anchor.style.r = newValue;
      });
    } else if (name === 'selectedAnchorStrokeOpacity') {
      this.selectedAnchors.forEach((anchor) => {
        anchor.style.strokeOpacity = newValue;
      });
    } else if (name === 'selectedAnchorFillOpacity') {
      this.selectedAnchors.forEach((anchor) => {
        anchor.style.fillOpacity = newValue;
      });
    }

    this.saveAnchorStyle();
  }
}
