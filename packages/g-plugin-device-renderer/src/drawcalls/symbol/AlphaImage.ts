// borrow from mapbox/src/symbol

export type GlyphMetrics = {
  width: number;
  height: number;
  left: number;
  top: number;
  advance: number;
};

export type StyleGlyph = {
  id: number;
  bitmap: AlphaImage;
  metrics: GlyphMetrics;
};

export type Size = {
  width: number;
  height: number;
};

export type Point = {
  x: number;
  y: number;
};

function createImage(
  image: any,
  { width, height }: Size,
  channels: number,
  data?: Uint8Array | Uint8ClampedArray,
) {
  if (!data) {
    data = new Uint8Array(width * height * channels);
  } else if (data.length !== width * height * channels) {
    throw new RangeError('mismatched image size');
  }
  image.width = width;
  image.height = height;
  image.data = data;
  return image;
}

function resizeImage(image: any, { width, height }: Size, channels: number) {
  if (width === image.width && height === image.height) {
    return;
  }

  const newImage = createImage({}, { width, height }, channels);

  copyImage(
    image,
    newImage,
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    {
      width: Math.min(image.width, width),
      height: Math.min(image.height, height),
    },
    channels,
  );

  image.width = width;
  image.height = height;
  image.data = newImage.data;
}

function copyImage(
  srcImg: any,
  dstImg: any,
  srcPt: Point,
  dstPt: Point,
  size: Size,
  channels: number,
) {
  if (size.width === 0 || size.height === 0) {
    return dstImg;
  }

  if (
    size.width > srcImg.width ||
    size.height > srcImg.height ||
    srcPt.x > srcImg.width - size.width ||
    srcPt.y > srcImg.height - size.height
  ) {
    throw new RangeError('out of range source coordinates for image copy');
  }

  if (
    size.width > dstImg.width ||
    size.height > dstImg.height ||
    dstPt.x > dstImg.width - size.width ||
    dstPt.y > dstImg.height - size.height
  ) {
    throw new RangeError('out of range destination coordinates for image copy');
  }

  const srcData = srcImg.data;
  const dstData = dstImg.data;

  for (let y = 0; y < size.height; y++) {
    const srcOffset = ((srcPt.y + y) * srcImg.width + srcPt.x) * channels;
    const dstOffset = ((dstPt.y + y) * dstImg.width + dstPt.x) * channels;
    for (let i = 0; i < size.width * channels; i++) {
      dstData[dstOffset + i] = srcData[srcOffset + i];
    }
  }

  return dstImg;
}

export class AlphaImage {
  width: number;
  height: number;
  data: Uint8Array | Uint8ClampedArray;

  constructor(size: Size, data?: Uint8Array | Uint8ClampedArray) {
    createImage(this, size, 1, data);
  }

  resize(size: Size) {
    resizeImage(this, size, 1);
  }

  clone() {
    return new AlphaImage(
      { width: this.width, height: this.height },
      new Uint8Array(this.data),
    );
  }

  static copy(
    srcImg: AlphaImage,
    dstImg: AlphaImage,
    srcPt: Point,
    dstPt: Point,
    size: Size,
  ) {
    copyImage(srcImg, dstImg, srcPt, dstPt, size, 1);
  }
}
