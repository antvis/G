import type { DataURLOptions } from '@antv/g';
import { CanvasConfig, ContextService, inject, isString, singleton } from '@antv/g';
import { createSVGElement } from '@antv/g-plugin-svg-renderer';

@singleton({ token: ContextService })
export class SVGContextService implements ContextService<SVGElement> {
  private $container: HTMLElement | null;
  private $namespace: SVGElement | null;
  private dpr: number;

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  async init() {
    const { container, document: doc } = this.canvasConfig;

    // create container
    this.$container = isString(container) ? (doc || document).getElementById(container) : container;
    if (this.$container) {
      if (!this.$container.style.position) {
        this.$container.style.position = 'relative';
      }
      const $namespace = createSVGElement('svg', doc);
      $namespace.setAttribute('width', `${this.canvasConfig.width}`);
      $namespace.setAttribute('height', `${this.canvasConfig.height}`);

      this.$container.appendChild($namespace);

      this.$namespace = $namespace;
    }

    let dpr = window.devicePixelRatio || 1;
    dpr = dpr >= 1 ? Math.ceil(dpr) : 1;
    this.dpr = dpr;
  }

  // @ts-ignore
  getDomElement() {
    return this.$namespace;
  }

  getContext() {
    return this.$namespace;
  }

  getDPR() {
    return this.dpr;
  }

  getBoundingClientRect() {
    return this.$namespace?.getBoundingClientRect();
  }

  destroy() {
    // destroy context
    if (this.$container && this.$namespace && this.$namespace.parentNode) {
      this.$container.removeChild(this.$namespace);
    }
  }

  resize(width: number, height: number) {
    if (this.$namespace) {
      this.$namespace.setAttribute('width', `${width}`);
      this.$namespace.setAttribute('height', `${height}`);
    }
  }

  applyCursorStyle(cursor: string) {
    if (this.$container) {
      this.$container.style.cursor = cursor;
    }
  }

  async toDataURL(options: Partial<DataURLOptions>) {
    return '';
  }
}
