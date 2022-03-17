import { Polygon, PolygonStyleProps } from "@antv/g";
import { BaseShape } from "./BaseShape";

export class PoligonShape extends BaseShape {
  getElementInstance() {
    const shape = new Polygon({
      style: this.getAttrsData() as PolygonStyleProps,
    });
    return shape;
  }
}

