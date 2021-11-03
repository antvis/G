import {
  Bindings,
  Color,
  InputState,
  RenderPass,
  RenderPassDescriptor,
  RenderPipeline,
  RenderTarget,
  Texture,
} from '../interfaces';
import { Growable } from './Growable';

export const enum RenderPassCmd {
  setRenderPassParameters = 471,
  setViewport,
  setScissor,
  setBindings,
  setPipeline,
  setInputState,
  setStencilRef,
  setDebugPointer,
  draw,
  drawIndexed,
  drawIndexedInstanced,
  end,
  invalid = 0x1234,
}

export class RenderPass_GL implements RenderPass {
  u32: Growable<Uint32Array> = new Growable((n) => new Uint32Array(n));
  f32: Growable<Float32Array> = new Growable((n) => new Float32Array(n));
  o: any[] = [];
  descriptor: RenderPassDescriptor;

  reset() {
    this.u32.r();
    this.f32.r();
    this.o.length = 0;
  }

  pu32(c: number) {
    this.u32.n(c);
  }
  pcmd(c: number) {
    this.pu32(c);
  }
  pf32(c: number) {
    this.f32.n(c);
  }
  po(r: any) {
    this.o.push(r);
  }

  end() {
    this.pcmd(RenderPassCmd.end);
  }
  setRenderPassParameters(
    ca: (RenderTarget | null)[],
    cr: (Texture | null)[],
    cc: (Color | 'load')[],
    dsa: RenderTarget | null,
    dsr: Texture | null,
    d: number,
    s: number,
  ) {
    this.pcmd(RenderPassCmd.setRenderPassParameters);
    this.pu32(ca.length);

    for (let i = 0; i < ca.length; i++) {
      this.po(ca[i]);
      this.po(cr[i]);
      const c = cc[i];
      if (c !== 'load') {
        this.pu32(1);
        this.pf32(c.r);
        this.pf32(c.g);
        this.pf32(c.b);
        this.pf32(c.a);
      } else {
        this.pu32(0);
      }
    }

    this.po(dsa);
    this.po(dsr);
    this.pf32(d);
    this.pf32(s);
  }

  setViewport(x: number, y: number, w: number, h: number) {
    this.pcmd(RenderPassCmd.setViewport);
    this.pf32(x);
    this.pf32(y);
    this.pf32(w);
    this.pf32(h);
  }
  setScissor(x: number, y: number, w: number, h: number) {
    this.pcmd(RenderPassCmd.setScissor);
    this.pf32(x);
    this.pf32(y);
    this.pf32(w);
    this.pf32(h);
  }
  setPipeline(r: RenderPipeline) {
    this.pcmd(RenderPassCmd.setPipeline);
    this.po(r);
  }
  setBindings(n: number, r: Bindings, o: number[]) {
    this.pcmd(RenderPassCmd.setBindings);
    this.pu32(n);
    this.po(r);
    this.pu32(o.length);
    for (let i = 0; i < o.length; i++) this.pu32(o[i]);
  }
  setInputState(r: InputState | null) {
    this.pcmd(RenderPassCmd.setInputState);
    this.po(r);
  }
  setStencilRef(v: number) {
    this.pcmd(RenderPassCmd.setStencilRef);
    this.pf32(v);
  }
  setDebugPointer(v: any) {
    this.pcmd(RenderPassCmd.setDebugPointer);
    this.po(v);
  }
  draw(a: number, b: number) {
    this.pcmd(RenderPassCmd.draw);
    this.pu32(a);
    this.pu32(b);
  }
  drawIndexed(a: number, b: number) {
    this.pcmd(RenderPassCmd.drawIndexed);
    this.pu32(a);
    this.pu32(b);
  }
  drawIndexedInstanced(a: number, b: number, c: number) {
    this.pcmd(RenderPassCmd.drawIndexedInstanced);
    this.pu32(a);
    this.pu32(b);
    this.pu32(c);
  }
}
