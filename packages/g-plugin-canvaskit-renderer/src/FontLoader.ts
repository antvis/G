import type { CanvasKit, Typeface, TypefaceFontProvider } from 'canvaskit-wasm';
import { singleton } from 'mana-syringe';

// const cdn = 'https://storage.googleapis.com/skia-cdn/misc/';

@singleton()
export class FontLoader {
  private cache: Record<
    string,
    {
      provider: TypefaceFontProvider;
      typeface: Typeface;
    }
  > = {};

  async loadFont(CanvasKit: CanvasKit, font: string, url: string) {
    if (!this.cache[font]) {
      // load fonts
      const response = await fetch(url);
      const fontBuffer = await response.arrayBuffer();
      const fontSrc = CanvasKit.TypefaceFontProvider.Make();
      const typeface = CanvasKit.Typeface.MakeFreeTypeFaceFromData(fontBuffer);
      fontSrc.registerFont(fontBuffer, font);
      this.cache[font] = {
        provider: fontSrc,
        typeface,
      };
    }
  }

  getTypefaceFontProvider(font: string) {
    return this.cache[font]?.provider;
  }

  getTypeface(font: string) {
    return this.cache[font]?.typeface;
  }
}
