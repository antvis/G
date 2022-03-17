import { IElement, Rect, RectStyleProps } from "@antv/g";
import { BaseShape } from "./BaseShape";

export class RectShape extends BaseShape {
  getElementInstance() {
    const rect = new Rect({
      style: this.getAttrsData() as RectStyleProps,
    });
    return rect;
  }
}
