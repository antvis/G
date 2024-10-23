import type { Canvas, DataURLOptions } from '@antv/g-lite';
import { isBrowser, Rectangle, runtime } from '@antv/g-lite';
import html2canvas from 'html2canvas';
import type { CanvasOptions, DownloadImageOptions } from './types';

export interface ImageExporterOptions {
  canvas: Canvas;
  defaultFilename?: string;
}

export class ImageExporter {
  constructor(private options: ImageExporterOptions) {}

  /**
   * return a HTMLCanvasElement which you can call `toDataURL` later
   *
   * @example
   * const canvas = await exporter.toCanvas();
   * canvas.toDataURL(); // data:
   */
  async toCanvas(options: Partial<CanvasOptions> = {}) {
    const { width, height, document: doc } = this.options.canvas.getConfig();
    const dpr = this.options.canvas.getContextService().getDPR();

    const {
      clippingRegion = new Rectangle(0, 0, width, height),
      beforeDrawImage,
      afterDrawImage,
      ignoreElements,
      ...rest
    } = options;
    const dataURL = await this.toDataURL(rest);
    const image = await this.getOrCreateImage(dataURL);

    const { x: sx, y: sy, width: sWidth, height: sHeight } = clippingRegion;

    // TODO: provide custom `createCanvas` method like `createImage`
    const canvas = (doc || document).createElement('canvas');
    canvas.width = sWidth * dpr;
    canvas.height = sHeight * dpr;
    const context = canvas.getContext('2d');

    context.scale(dpr, dpr);

    if (beforeDrawImage) {
      beforeDrawImage(context);
    }

    const sourceImageMultipiler = image.width > width ? dpr : 1;
    context.drawImage(
      image,
      sx * sourceImageMultipiler,
      sy * sourceImageMultipiler,
      sWidth * sourceImageMultipiler,
      sHeight * sourceImageMultipiler,
      0,
      0,
      sWidth,
      sHeight,
    );

    if (!this.isSVG()) {
      const $dom = this.options.canvas
        .getContextService()
        .getDomElement() as HTMLCanvasElement;
      if ($dom && $dom.parentElement) {
        // screenshot HTML
        // @see https://html2canvas.hertzen.com/configuration
        const canvas = await html2canvas($dom.parentElement, {
          backgroundColor: null,
          width,
          height,
          x: 0,
          y: 0,
          ignoreElements: (element: Element) => {
            if (element === $dom) {
              return true;
            }
            return ignoreElements && ignoreElements(element);
          },
        });

        const image = await this.getOrCreateImage(canvas.toDataURL());
        context.drawImage(
          image,
          sx * sourceImageMultipiler,
          sy * sourceImageMultipiler,
          sWidth * sourceImageMultipiler,
          sHeight * sourceImageMultipiler,
          0,
          0,
          sWidth,
          sHeight,
        );
      }
    }

    if (afterDrawImage) {
      afterDrawImage(context);
    }

    return canvas;
  }

  /**
   * generate data url for the whole viewport
   */
  private async toDataURL(options: Partial<DataURLOptions> = {}) {
    return this.options.canvas.getContextService().toDataURL(options);
  }

  private isSVG() {
    return (
      isBrowser &&
      this.options.canvas.getContextService().getDomElement() instanceof
        SVGSVGElement
    );
  }

  async toSVGDataURL() {
    if (this.isSVG()) {
      return this.toDataURL();
    }
  }

  downloadImage(options: DownloadImageOptions) {
    const { document: doc } = this.options.canvas.getConfig();

    // retrieve context at runtime
    const { defaultFilename } = this.options;
    const { dataURL, name = defaultFilename || 'g' } = options;
    const mimeType = dataURL.substring(
      dataURL.indexOf(':') + 1,
      dataURL.indexOf(';'),
    );
    const suffix = mimeType.split('/')[1];

    // g-svg only support .svg
    const isSVG = dataURL.startsWith('data:image/svg');
    const fileName = `${name}.${isSVG ? 'svg' : suffix}`;

    const link: HTMLAnchorElement = (doc || document).createElement('a');

    if (isSVG) {
      link.addEventListener('click', () => {
        link.download = fileName;
        link.href = dataURL;
      });
    } else if (window.Blob && window.URL) {
      const arr = dataURL.split(',');
      let mime = '';
      if (arr && arr.length > 0) {
        const match = arr[0].match(/:(.*?);/);
        // eslint-disable-next-line prefer-destructuring
        if (match && match.length >= 2) mime = match[1];
      }

      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      const blobObj = new Blob([u8arr], { type: mime });

      // account for IE
      // @see https://stackoverflow.com/a/41434373
      if (runtime.globalThis.navigator.msSaveBlob) {
        runtime.globalThis.navigator.msSaveBlob(blobObj, fileName);
      } else {
        link.addEventListener('click', () => {
          link.download = fileName;
          link.href = window.URL.createObjectURL(blobObj);
        });
      }
    }

    // trigger click
    if (link.click) {
      link.click();
    } else {
      const e = (doc || document).createEvent('MouseEvents');
      e.initEvent('click', false, false);
      link.dispatchEvent(e);
    }
  }

  private getOrCreateImage(src: string): Promise<HTMLImageElement> {
    // @see https://github.com/antvis/g/issues/938
    const { createImage } = this.options.canvas.getConfig();

    return new Promise((resolve, reject) => {
      let image: HTMLImageElement;
      if (createImage) {
        image = createImage(src);
      } else if (isBrowser) {
        image = new window.Image();
      }

      if (image) {
        image.onload = () => {
          resolve(image);
        };
        image.onerror = (ev) => {
          reject(ev);
        };
        image.crossOrigin = 'Anonymous';
        image.src = src;
      }
    });
  }
}
