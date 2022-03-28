import type { EllipseStyleProps } from "@antv/g";
import { Ellipse } from "@antv/g";
import { BaseShape } from "./BaseShape";

export class EllipseShape extends BaseShape {
  getElementInstance() {
    const shape = new Ellipse({
      style: this.getAttrsData() as EllipseStyleProps,
    });
    return shape;
  }
}

