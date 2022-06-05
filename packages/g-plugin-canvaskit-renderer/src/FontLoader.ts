import type { CanvasKit, TypefaceFontProvider } from 'canvaskit-wasm';
import { singleton } from 'mana-syringe';

// const cdn = 'https://storage.googleapis.com/skia-cdn/misc/';

@singleton()
export class FontLoader {
  private cache: Record<string, TypefaceFontProvider> = {};

  async loadFont(CanvasKit: CanvasKit, font: string, url: string) {
    if (!this.cache[font]) {
      // load fonts
      const response = await fetch(url);
      const fontBuffer = await response.arrayBuffer();
      const fontSrc = CanvasKit.TypefaceFontProvider.Make();
      fontSrc.registerFont(fontBuffer, font);
      this.cache[font] = fontSrc;
    }
  }

  getTypefaceFontProvider(font: string) {
    return this.cache[font];
  }
}
