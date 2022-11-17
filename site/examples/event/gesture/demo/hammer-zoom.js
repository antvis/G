import { Canvas, CanvasEvent, Image as GImage } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import Hammer from 'hammerjs';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

/**
 * Pinch Zoom And Pan With HammerJS
 * @see https://bl.ocks.org/redgeoff/6be0295e6ebf18649966d48768398252
 */

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 200;
const MIN_SCALE = 1; // 1=scaling when first loaded
const MAX_SCALE = 64;

const canvasRenderer = new CanvasRenderer();
const webglRenderer = new WebGLRenderer();
const svgRenderer = new SVGRenderer();
const canvas = new Canvas({
  container: 'container',
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  renderer: canvasRenderer,
});

// prevent browser default actions
// @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/touch-action
const $canvas = canvas.getContextService().getDomElement();
$canvas.style.touchAction = 'none';

canvas.addEventListener(CanvasEvent.READY, () => {
  let image;

  let imgWidth = null;
  let imgHeight = null;
  let viewportWidth = CANVAS_WIDTH;
  let viewportHeight = CANVAS_HEIGHT;
  let scale = null;
  let lastScale = null;
  let img = null;
  let x = 0;
  let lastX = 0;
  let y = 0;
  let lastY = 0;
  let pinchCenter = null;
  let pinchCenterOffset = null;
  let curWidth;
  let curHeight;

  // Traverse the DOM to calculate the absolute position of an element
  const absolutePosition = function (el) {
    const { top, left } = canvas
      .getContextService()
      .getDomElement()
      .getBoundingClientRect();
    return { x: left, y: top };
  };

  const restrictScale = (scale) => {
    if (scale < MIN_SCALE) {
      scale = MIN_SCALE;
    } else if (scale > MAX_SCALE) {
      scale = MAX_SCALE;
    }
    return scale;
  };

  const restrictRawPos = (pos, viewportDim, imgDim) => {
    if (pos < viewportDim / scale - imgDim) {
      // too far left/up?
      pos = viewportDim / scale - imgDim;
    } else if (pos > 0) {
      // too far right/down?
      pos = 0;
    }
    return pos;
  };

  const updateLastPos = (deltaX, deltaY) => {
    lastX = x;
    lastY = y;
  };

  const translate = (deltaX, deltaY) => {
    // We restrict to the min of the viewport width/height or current width/height as the
    // current width/height may be smaller than the viewport width/height
    const newX = restrictRawPos(
      lastX + deltaX / scale,
      Math.min(viewportWidth, curWidth),
      imgWidth,
    );
    x = newX;

    const newY = restrictRawPos(
      lastY + deltaY / scale,
      Math.min(viewportHeight, curHeight),
      imgHeight,
    );
    y = newY;

    image.setLocalPosition(Math.ceil(newX * scale), Math.ceil(newY * scale));
  };

  const zoom = (scaleBy) => {
    scale = restrictScale(lastScale * scaleBy);

    curWidth = imgWidth * scale;
    curHeight = imgHeight * scale;

    image.style.width = Math.ceil(curWidth);
    image.style.height = Math.ceil(curHeight);

    // Adjust margins to make sure that we aren't out of bounds
    translate(0, 0);
  };

  const rawCenter = (e) => {
    const pos = absolutePosition(canvas);

    // We need to account for the scroll position
    const scrollLeft = window.pageXOffset
      ? window.pageXOffset
      : document.body.scrollLeft;
    const scrollTop = window.pageYOffset
      ? window.pageYOffset
      : document.body.scrollTop;

    const zoomX = -x + (e.center.x - pos.x + scrollLeft) / scale;
    const zoomY = -y + (e.center.y - pos.y + scrollTop) / scale;

    return { x: zoomX, y: zoomY };
  };

  const updateLastScale = function () {
    lastScale = scale;
  };

  const zoomAround = (scaleBy, rawZoomX, rawZoomY, doNotUpdateLast) => {
    // Zoom
    zoom(scaleBy);

    // New raw center of viewport
    const rawCenterX = -x + Math.min(viewportWidth, curWidth) / 2 / scale;
    const rawCenterY = -y + Math.min(viewportHeight, curHeight) / 2 / scale;

    // Delta
    const deltaX = (rawCenterX - rawZoomX) * scale;
    const deltaY = (rawCenterY - rawZoomY) * scale;

    // Translate back to zoom center
    translate(deltaX, deltaY);

    if (!doNotUpdateLast) {
      updateLastScale();
      updateLastPos();
    }
  };

  const zoomCenter = (scaleBy) => {
    // Center of viewport
    const zoomX = -x + Math.min(viewportWidth, curWidth) / 2 / scale;
    const zoomY = -y + Math.min(viewportHeight, curHeight) / 2 / scale;

    zoomAround(scaleBy, zoomX, zoomY);
  };

  const zoomIn = () => {
    zoomCenter(2);
  };

  const zoomOut = () => {
    zoomCenter(1 / 2);
  };

  img = new Image();

  img.src =
    'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*wnQmQ6j3UGQAAAAAAAAAAAAAARQnAQ';
  img.crossOrigin = 'Anonymous';
  img.onload = () => {
    // 图片加载成功后创建
    image = new GImage({
      style: {
        width: CANVAS_WIDTH,
        height: (CANVAS_WIDTH * 119) / 960,
        src: img, // 传入 Image 对象
      },
    });
    canvas.appendChild(image);

    imgWidth = image.style.width;
    imgHeight = image.style.height;
    scale = viewportWidth / imgWidth;
    lastScale = scale;
    curWidth = imgWidth * scale;
    curHeight = imgHeight * scale;

    // use hammer.js
    const hammer = new Hammer(image, {
      inputClass: Hammer.PointerEventInput,
    });

    hammer.get('pinch').set({
      enable: true,
    });

    hammer.on('pan', function (e) {
      translate(e.deltaX, e.deltaY);
    });

    hammer.on('panend', function (e) {
      updateLastPos();
    });

    hammer.on('pinch', function (e) {
      // We only calculate the pinch center on the first pinch event as we want the center to
      // stay consistent during the entire pinch
      if (pinchCenter === null) {
        pinchCenter = rawCenter(e);
        var offsetX =
          pinchCenter.x * scale -
          (-x * scale + Math.min(viewportWidth, curWidth) / 2);
        var offsetY =
          pinchCenter.y * scale -
          (-y * scale + Math.min(viewportHeight, curHeight) / 2);
        pinchCenterOffset = { x: offsetX, y: offsetY };
      }

      // When the user pinch zooms, she/he expects the pinch center to remain in the same
      // relative location of the screen. To achieve this, the raw zoom center is calculated by
      // first storing the pinch center and the scaled offset to the current center of the
      // image. The new scale is then used to calculate the zoom center. This has the effect of
      // actually translating the zoom center on each pinch zoom event.
      var newScale = restrictScale(scale * e.scale);
      var zoomX = pinchCenter.x * newScale - pinchCenterOffset.x;
      var zoomY = pinchCenter.y * newScale - pinchCenterOffset.y;
      var zoomCenter = { x: zoomX / newScale, y: zoomY / newScale };

      zoomAround(e.scale, zoomCenter.x, zoomCenter.y, true);
    });

    hammer.on('pinchend', function (e) {
      updateLastScale();
      updateLastPos();
      pinchCenter = null;
    });

    hammer.on('doubletap', function (e) {
      const c = rawCenter(e);
      zoomAround(2, c.x, c.y);
    });

    // GUI
    const gui = new lil.GUI({ autoPlace: false });
    $wrapper.appendChild(gui.domElement);
    const rendererFolder = gui.addFolder('renderer');
    const rendererConfig = {
      renderer: 'canvas',
    };
    rendererFolder
      .add(rendererConfig, 'renderer', ['canvas', 'webgl', 'svg'])
      .onChange((renderer) => {
        canvas.setRenderer(
          renderer === 'canvas'
            ? canvasRenderer
            : renderer === 'webgl'
            ? webglRenderer
            : svgRenderer,
        );
      });
    rendererFolder.open();
    const zoomFolder = gui.addFolder('zoom');
    const zoomConfig = {
      zoomIn,
      zoomOut,
    };
    zoomFolder.add(zoomConfig, 'zoomIn');
    zoomFolder.add(zoomConfig, 'zoomOut');
  };

  // stats
  const stats = new Stats();
  stats.showPanel(0);
  const $stats = stats.dom;
  $stats.style.position = 'absolute';
  $stats.style.left = '0px';
  $stats.style.top = '0px';
  const $wrapper = document.getElementById('container');
  $wrapper.appendChild($stats);
  canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
    if (stats) {
      stats.update();
    }
  });
});
