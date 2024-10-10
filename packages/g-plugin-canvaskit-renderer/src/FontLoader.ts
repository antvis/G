import type {
  CanvasKit,
  FontMgr,
  Typeface,
  TypefaceFontProvider,
} from 'canvaskit-wasm';

// const cdn = 'https://storage.googleapis.com/skia-cdn/misc/';

export class FontLoader {
  private cache: Record<
    string,
    {
      provider: TypefaceFontProvider;
      typeface: Typeface;
      fontBuffer: ArrayBuffer;
    }
  > = {};

  private fontMgrCache: Record<string, FontMgr> = {};

  async loadFont(CanvasKit: CanvasKit, font: string, url: string) {
    // load fonts
    const response = await fetch(url);
    const fontBuffer = await response.arrayBuffer();
    const fontSrc = CanvasKit.TypefaceFontProvider.Make();
    const typeface = CanvasKit.Typeface.MakeFreeTypeFaceFromData(fontBuffer);
    fontSrc.registerFont(fontBuffer, font);
    this.cache[font] = {
      provider: fontSrc,
      typeface,
      fontBuffer,
    };
  }

  getTypefaceFontProvider(font: string) {
    return this.cache[font]?.provider;
  }

  getTypeface(font: string) {
    return this.cache[font]?.typeface;
  }

  getFontBuffer(font: string) {
    return this.cache[font]?.fontBuffer;
  }

  getOrCreateFontMgr(CanvasKit: CanvasKit, fontFamilies: string[]) {
    const cacheKey = fontFamilies.join(',');
    if (!this.fontMgrCache[cacheKey]) {
      this.fontMgrCache[cacheKey] = CanvasKit.FontMgr.FromData(
        ...fontFamilies.map((font) => this.getFontBuffer(font)),
      );
    }

    return this.fontMgrCache[cacheKey];
  }

  destroy() {
    Object.keys(this.fontMgrCache).forEach((font) => {
      this.fontMgrCache[font].delete();
    });

    Object.keys(this.cache).forEach((key) => {
      this.cache[key].provider.delete();
      this.cache[key].typeface.delete();
    });

    this.cache = {};
    this.fontMgrCache = {};
  }
}
