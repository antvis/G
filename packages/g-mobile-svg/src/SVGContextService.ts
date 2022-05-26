import { CanvasConfig, ContextService, isString } from '@antv/g';
import { inject, singleton } from 'mana-syringe';
import { createSVGElement } from '@antv/g-plugin-svg-renderer';

@singleton({ token: ContextService })
export class SVGContextService implements ContextService<SVGElement> {
  private $container: HTMLElement | null;
  private $namespace: SVGElement | null;
  private dpr: number;
  private width: number;
  private height: number;

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  init() {
    const { container, width, height } = this.canvasConfig;

    // create container
    this.$container = isString(container) ? document.getElementById(container) : container;
    if (this.$container) {
      if (!this.$container.style.position) {
        this.$container.style.position = 'relative';
      }
      const $namespace = createSVGElement('svg');
      $namespace.setAttribute('width', `${width}`);
      $namespace.setAttribute('height', `${height}`);

      this.$container.appendChild($namespace);

      this.$namespace = $namespace;
    }

    let dpr = window.devicePixelRatio || 1;
    dpr = dpr >= 1 ? Math.ceil(dpr) : 1;
    this.dpr = dpr;
    this.resize(width, height);
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
    this.width = width;
    this.height = height;
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  applyCursorStyle(cursor: string) {
    if (this.$container) {
      this.$container.style.cursor = cursor;
    }
  }
}
