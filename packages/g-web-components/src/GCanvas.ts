import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import type { IRenderer } from '@antv/g-lite';
import { Canvas } from '@antv/g-lite';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { GElement } from './GElement';

const registerToDevtool = (canvas: Canvas) => {
  if (!window.__g_instances__) {
    window.__g_instances__ = [];
  }
  window.__g_instances__.push(canvas);
};

export class GCanvasElement extends GElement {
  static get observedAttributes() {
    return ['renderer', 'width', 'height', 'background'];
  }

  renderer: IRenderer | null = null;
  gCanvas: Canvas | null = null;
  connectedCallback() {
    const renderer = this.getAttribute('renderer');
    const width = Number(this.getAttribute('width')) || 0;
    const height = Number(this.getAttribute('height')) || 0;

    const shadow = this.attachShadow({ mode: 'closed' });
    const element = document.createElement('div');
    shadow.appendChild(element);
    const canvas = new Canvas({
      container: element,
      width,
      height,
      renderer:
        renderer === 'canvas' ? new CanvasRenderer() : new WebGLRenderer(),
    });
    this.gCanvas = canvas;
    this.gElement = canvas.getRoot();
    registerToDevtool(canvas);
  }
}
