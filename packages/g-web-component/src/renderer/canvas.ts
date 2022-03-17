import { Canvas } from "@antv/g";
import { Renderer } from "@antv/g-canvas";
import GElement from "../GElement";

const registerToDevtool = (canvas: Canvas) => {
  if (!window.__g_instances__) {
    window.__g_instances__ = []
  }
  window.__g_instances__.push(canvas);
}

export class GCanvasElement extends GElement {
  renderer = new Renderer();
  gCanvas: Canvas|null = null;
  connectedCallback() {
    const { clientWidth, clientHeight } = this;
    const shadow = this.attachShadow({ mode: "closed" });
    const element = document.createElement("div");
    shadow.appendChild(element);
    const canvas = new Canvas({
      container: element,
      width: clientWidth || 0,
      height: clientHeight || 0,
      renderer: this.renderer,
    });
    this.gCanvas = canvas;
    this.gElement = canvas.getRoot();
    registerToDevtool(canvas)
  }
}
