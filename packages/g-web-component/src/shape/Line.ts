import { Line, LineStyleProps } from "@antv/g";
import { BaseShape } from "./BaseShape";

export class LineShape extends BaseShape {
  getElementInstance() {
    const shape = new Line({
      style: this.getAttrsData() as LineStyleProps,
    });
    return shape;
  }
}

