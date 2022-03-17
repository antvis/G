import { Image, ImageStyleProps } from "@antv/g";
import { BaseShape } from "./BaseShape";

export class ImageShape extends BaseShape {
  getElementInstance() {
    const shape = new Image({
      style: this.getAttrsData() as ImageStyleProps,
    });
    return shape;
  }
}

