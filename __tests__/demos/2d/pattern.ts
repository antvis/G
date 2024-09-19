import { Rect, HTML } from '@antv/g';
import SimplexNoise from 'simplex-noise';

/**
 * <pattern>
 * support the following image source:
 * * HTMLImageElement (<img>)
 * * HTMLCanvasElement (<canvas>)
 * * HTMLVideoElement (<video>)
 * * ImageData
 * @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/createPattern#%E5%8F%82%E6%95%B0
 */
export async function pattern({ canvas }) {
  await canvas.ready;

  // <img> URL
  const rect1 = new Rect({
    style: {
      x: 50,
      y: 50,
      width: 200,
      height: 100,
      fill: {
        image:
          'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*jgjxQ57sACsAAAAAAAAAAAAAARQnAQ',
        repetition: 'no-repeat',
      },
    },
  });

  // HTMLCanvasElement (<canvas>)
  // @see https://observablehq.com/@awoodruff/canvas-cartography-nacis-2019
  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = 20;
  patternCanvas.height = 20;
  const ctx = patternCanvas.getContext('2d')!;
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0.5; i < 20; i += 5) {
    ctx.moveTo(0, i);
    ctx.lineTo(20, i);
  }
  ctx.stroke();
  const rect3 = new Rect({
    style: {
      x: 50,
      y: 200,
      width: 200,
      height: 100,
      fill: {
        image: patternCanvas,
        repetition: 'repeat',
      },
    },
  });

  const width = 200;
  const height = 100;
  const noiseCanvas = document.createElement('canvas');
  noiseCanvas.width = width;
  noiseCanvas.height = height;
  const context = noiseCanvas.getContext('2d')!;
  const image = context.createImageData(width, height);
  const noise = new SimplexNoise(10);
  for (let z = 0, y = 0, i = 0; y < height; ++y) {
    for (let x = 0; x < width; ++x, i += 4) {
      image.data[i + 3] = (noise.noise2D(x / 64, y / 64) + 1) * 128;
    }
  }
  context.putImageData(image, 0, 0);
  const rect4 = new Rect({
    style: {
      x: 300,
      y: 200,
      width: 200,
      height: 100,
      fill: {
        image: context.canvas,
        repetition: 'repeat',
      },
    },
  });

  canvas.appendChild(rect1);
  canvas.appendChild(rect3);
  canvas.appendChild(rect4);

  {
    // HTMLImageElement(<img>)
    const image = new window.Image();
    image.onload = () => {
      const rect2 = new Rect({
        style: {
          x: 300,
          y: 50,
          width: 200,
          height: 100,
          fill: {
            image,
            repetition: 'repeat',
          },
        },
      });
      canvas.appendChild(rect2);
    };
    // without `crossOrigin`, it will throw 'WebGL2RenderingContext': Tainted canvases may not be loaded.
    image.crossOrigin = 'Anonymous';
    image.src =
      'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*jgjxQ57sACsAAAAAAAAAAAAAARQnAQ';

    // HTMLVideoElement(<video>)
    const video = document.createElement('video');
    video.src =
      'https://gw.alipayobjects.com/v/rms_6ae20b/afts/video/A*VD0TTbZB9WMAAAAAAAAAAAAAARQnAQ/720P';
    video.crossOrigin = 'Anonymous';
    video.autoplay = true;
    video.controls = false;
    video.muted = true;
    video.height = 100;
    video.width = 200;

    video.onloadeddata = function () {
      const rect5 = new Rect({
        style: {
          x: 50,
          y: 350,
          width: 200,
          height: 100,
          fill: {
            image: video,
            repetition: 'no-repeat',
          },
        },
      });
      canvas.appendChild(rect5);
    };
  }

  canvas.appendChild(
    new HTML({
      style: {
        x: 100,
        y: 20,
        height: 30,
        width: 200,
        innerHTML: 'image URL',
      },
    }),
  );

  canvas.appendChild(
    new HTML({
      style: {
        x: 300,
        y: 20,
        height: 30,
        width: 200,
        innerHTML: 'HTMLImageElement(&lt;img&gt;)',
      },
    }),
  );

  canvas.appendChild(
    new HTML({
      style: {
        x: 50,
        y: 170,
        height: 30,
        width: 300,
        innerHTML: 'HTMLCanvasElement(&lt;canvas&gt;)',
      },
    }),
  );

  canvas.appendChild(
    new HTML({
      style: {
        x: 50,
        y: 320,
        height: 30,
        width: 300,
        innerHTML: 'HTMLVideoElement(&lt;video&gt;)',
      },
    }),
  );

  canvas.appendChild(
    new HTML({
      style: {
        x: 300,
        y: 170,
        height: 30,
        width: 300,
        innerHTML: 'Perlin Noise',
      },
    }),
  );
}
