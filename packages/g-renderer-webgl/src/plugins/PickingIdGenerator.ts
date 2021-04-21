import { injectable } from 'inversify';

@injectable()
export class PickingIdGenerator {
  private counter = 0;

  getId() {
    return this.counter++;
  }

  reset() {
    this.counter = 0;
  }

  decodePickingColor(color: Uint8Array): number {
    const [i1, i2, i3] = color;
    const index = i1 + i2 * 256 + i3 * 65536 - 1;
    return index;
  }

  encodePickingColor(featureIdx: number): [number, number, number] {
    return [(featureIdx + 1) & 255, ((featureIdx + 1) >> 8) & 255, (((featureIdx + 1) >> 8) >> 8) & 255];
  }
}
