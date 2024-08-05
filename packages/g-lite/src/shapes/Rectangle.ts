import { mat4, vec4 } from 'gl-matrix';

type RectangleLike = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export class Rectangle implements DOMRect {
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMRect/fromRect_static
   */
  static fromRect(rect: RectangleLike) {
    return new Rectangle(rect.x, rect.y, rect.width, rect.height);
  }

  /**
   * will return a new rect instance
   */
  static applyTransform(rect: Rectangle, matrix: mat4) {
    const topLeft = vec4.fromValues(rect.x, rect.y, 0, 1);
    const topRight = vec4.fromValues(rect.x + rect.width, rect.y, 0, 1);
    const bottomLeft = vec4.fromValues(rect.x, rect.y + rect.height, 0, 1);
    const bottomRight = vec4.fromValues(
      rect.x + rect.width,
      rect.y + rect.height,
      0,
      1,
    );

    const transformedTopLeft = vec4.create();
    const transformedTopRight = vec4.create();
    const transformedBottomLeft = vec4.create();
    const transformedBottomRight = vec4.create();

    vec4.transformMat4(transformedTopLeft, topLeft, matrix);
    vec4.transformMat4(transformedTopRight, topRight, matrix);
    vec4.transformMat4(transformedBottomLeft, bottomLeft, matrix);
    vec4.transformMat4(transformedBottomRight, bottomRight, matrix);

    const minX = Math.min(
      transformedTopLeft[0],
      transformedTopRight[0],
      transformedBottomLeft[0],
      transformedBottomRight[0],
    );
    const minY = Math.min(
      transformedTopLeft[1],
      transformedTopRight[1],
      transformedBottomLeft[1],
      transformedBottomRight[1],
    );
    const maxX = Math.max(
      transformedTopLeft[0],
      transformedTopRight[0],
      transformedBottomLeft[0],
      transformedBottomRight[0],
    );
    const maxY = Math.max(
      transformedTopLeft[1],
      transformedTopRight[1],
      transformedBottomLeft[1],
      transformedBottomRight[1],
    );

    return Rectangle.fromRect({
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    });
  }

  left: number;
  right: number;
  top: number;
  bottom: number;
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
  ) {
    this.left = x;
    this.right = x + width;
    this.top = y;
    this.bottom = y + height;
  }
  toJSON() {}
}
