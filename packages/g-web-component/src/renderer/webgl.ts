import { Canvas } from "@antv/g";
import { Renderer } from "@antv/g-webgl";
import GElement from "../GElement";

export class GWebGLElement extends GElement {
  renderer = new Renderer();
  gCanvas: Canvas | null = null;
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
  }
}
