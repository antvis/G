import type { DisplayObject } from '@antv/g-lite';

export class PickingIdGenerator {
  private counter = 0;

  private id2DisplayObjectMap: Record<number, DisplayObject> = {};

  getId(displayObject: DisplayObject) {
    const id = this.counter++;
    this.id2DisplayObjectMap[id] = displayObject;
    return id;
  }

  getById(id: number): DisplayObject {
    return this.id2DisplayObjectMap[id];
  }

  deleteById(id: number) {
    delete this.id2DisplayObjectMap[id];
  }

  reset() {
    this.counter = 0;
    this.id2DisplayObjectMap = {};
  }

  decodePickingColor(color: Uint8Array): number {
    const [i1, i2, i3] = color;
    const index = i1 + i2 * 256 + i3 * 65536 - 1;
    return index;
  }

  encodePickingColor(featureIdx: number): [number, number, number] {
    return [
      (featureIdx + 1) & 255,
      ((featureIdx + 1) >> 8) & 255,
      (((featureIdx + 1) >> 8) >> 8) & 255,
    ];
  }
}
