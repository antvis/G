export class Rect implements DOMRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
  constructor(public x: number, public y: number, public width: number, public height: number) {
    this.left = x;
    this.right = x + width;
    this.top = y;
    this.bottom = y + height;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
  }
  toJSON() {}
}
