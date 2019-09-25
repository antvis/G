import { Point } from './types';

class BBox {
  readonly x: number;
  readonly y: number;
  readonly height: number;
  readonly width: number;

  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;

  readonly tl: Point;
  readonly tr: Point;
  readonly bl: Point;
  readonly br: Point;

  public static fromRange(minX: number, minY: number, maxX: number, maxY: number) {
    return new BBox(minX, minY, maxX - minX, maxY - minY);
  }

  constructor(x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
    // 包围盒范围
    this.height = height;
    this.width = width;
    this.x = this.minX = x;
    this.y = this.minY = y;
    const maxX = (this.maxX = x + width);
    const maxY = (this.maxY = y + height);

    // 包围盒的四个顶点坐标
    this.tl = { x, y };
    this.tr = { x: maxX, y };
    this.bl = { x, y: maxY };
    this.br = { x: maxX, y: maxY };
  }

  /**
   * 包围盒是否相等
   * @param {BBox} bbox 包围盒
   * @returns      包围盒是否相等
   */
  equal(bbox: BBox): boolean {
    return this.x === bbox.x && this.y === bbox.y && this.width === bbox.width && this.height === bbox.height;
  }

  /**
   * 克隆包围盒
   * @returns 包围盒
   */
  clone(): BBox {
    return new BBox(this.x, this.y, this.width, this.height);
  }

  /**
   * 合并包围盒
   * @returns 包围盒
   */
  merge(bbox): BBox {
    if (!bbox) {
      return this;
    }
    const minX = Math.min(this.minX, bbox.minX);
    const minY = Math.min(this.minY, bbox.minY);
    const maxX = Math.max(this.maxX, bbox.maxX);
    const maxY = Math.max(this.maxY, bbox.maxY);
    return BBox.fromRange(minX, minY, maxX, maxY);
  }

  /**
   * 获取包围盒大小
   * @returns 包围盒大小
   */
  size(): number {
    return this.width * this.height;
  }
}

export default BBox;
