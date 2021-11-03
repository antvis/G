type ArrayBufferView2 = Float32Array | Uint32Array;

export class Growable<T extends ArrayBufferView2> {
  public b: T;
  public i: number;
  public o: number;

  constructor(public m: (n: number) => T, public a: number = 0x400) {
    this.i = this.a;
    this.b = m(this.i);
    this.o = 0;
  }

  public r() {
    this.o = 0;
  }

  public n(v: number) {
    if (this.o + 1 > this.b.length) {
      const b = this.m(this.b.length + this.a);
      b.set(this.b);
      this.b = b;
    }

    this.b[this.o++] = v;
  }
}
