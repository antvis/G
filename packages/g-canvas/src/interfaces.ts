import { IElement } from '@antv/g-base/lib/interfaces';

export interface ICanvasElement extends IElement {
  draw(context: CanvasRenderingContext2D);
}
