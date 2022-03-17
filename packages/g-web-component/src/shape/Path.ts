import { Path, PathStyleProps } from "@antv/g";
import { BaseShape } from "./BaseShape";

export class PathShape extends BaseShape {
  getElementInstance() {
    const shape = new Path({
      style: this.getAttrsData() as PathStyleProps,
    });
    return shape;
  }
}

