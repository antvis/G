import type { DataURLOptions } from '@antv/g';
import type { DownloadImageOptions, ExporterOptions } from './types';

export class Exporter {
  constructor(private options: ExporterOptions) {}

  toCanvas() {
    const { width, height } = this.options.canvas.getConfig();
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    // const context = canvas.getContext('2d');
    // const canvasData = context.getImageData(0, 0, width, height);

    return canvas;
  }

  async toDataURL(options: Partial<DataURLOptions> = {}) {
    // retrieve context at runtime
    const context = this.options.canvas.getContextService();
    return context.toDataURL(options);
  }

  async downloadImage(options: Partial<DownloadImageOptions> = {}) {
    // retrieve context at runtime
    const { defaultFilename } = this.options;
    const dataURL = await this.toDataURL(options);
    const { type = 'image/png', name = defaultFilename || 'g' } = options;
    const suffix = type.split('/')[1];

    // g-svg only support .svg
    const isSVG = dataURL.startsWith('data:image/svg');
    const fileName = `${name}.${isSVG ? 'svg' : suffix}`;

    const link: HTMLAnchorElement = document.createElement('a');

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
      if ((window.navigator as any).msSaveBlob) {
        (window.navigator as any).msSaveBlob(blobObj, fileName);
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
      const e = document.createEvent('MouseEvents');
      e.initEvent('click', false, false);
      link.dispatchEvent(e);
    }
  }
}
