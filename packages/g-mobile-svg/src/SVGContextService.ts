import type {
  CanvasContext,
  DataURLOptions,
  ContextService,
  CanvasConfig,
  GlobalRuntime,
} from '@antv/g-lite';
import { createSVGElement } from '@antv/g-plugin-svg-renderer';
import { isString } from '@antv/util';

export class SVGContextService implements ContextService<SVGElement> {
  private $container: HTMLElement | null;
  private $namespace: SVGElement | null;
  private dpr: number;

  private canvasConfig: Partial<CanvasConfig>;

  constructor(context: GlobalRuntime & CanvasContext) {
    this.canvasConfig = context.config;
  }

  async init() {
    const { container, document: doc } = this.canvasConfig;

    // create container
    this.$container = isString(container)
      ? (doc || document).getElementById(container)
      : container;
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

  async toDataURL(options: Partial<DataURLOptions> = {}) {
    const cloneNode = this.$namespace.cloneNode(true);
    const svgDocType = document.implementation.createDocumentType(
      'svg',
      '-//W3C//DTD SVG 1.1//EN',
      'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd',
    );
    const svgDoc = document.implementation.createDocument(
      'http://www.w3.org/2000/svg',
      'svg',
      svgDocType,
    );
    svgDoc.replaceChild(cloneNode, svgDoc.documentElement);
    return `data:image/svg+xml;charset=utf8,${encodeURIComponent(
      new XMLSerializer().serializeToString(svgDoc),
    )}`;
  }
}
