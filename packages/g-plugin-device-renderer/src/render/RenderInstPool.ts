import { RenderInst } from './RenderInst';

export class RenderInstPool {
  // The pool contains all render insts that we've ever created.
  pool: RenderInst[] = [];
  // The number of render insts currently allocated out to the user.
  allocCount = 0;

  allocRenderInstIndex(): number {
    this.allocCount++;

    if (this.allocCount > this.pool.length) {
      this.pool.push(new RenderInst());
    }

    return this.allocCount - 1;
  }

  popRenderInst(): void {
    this.allocCount--;
  }

  reset(): void {
    for (let i = 0; i < this.pool.length; i++) {
      this.pool[i].reset();
    }
    this.allocCount = 0;
  }

  destroy(): void {
    this.pool.length = 0;
    this.allocCount = 0;
  }
}
