import { Canvas, CanvasEvent, Text } from '@antv/g';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

/**
 * Use paragraph shaping.
 * @see https://skia.org/docs/user/modules/quickstart/#text-shaping
 *
 * @see https://github.com/flutter/flutter/issues/76473
 * @see https://github.com/flutter/flutter/issues/90135#issuecomment-984916656
 *
 * TextStyle API:
 * @see https://api.flutter.dev/flutter/painting/TextStyle-class.html
 */

const canvaskitRenderer = new CanvaskitRenderer({
  wasmDir: '/',
  fonts: [
    {
      name: 'Roboto',
      url: '/Roboto-Regular.ttf',
    },
    {
      name: 'sans-serif',
      url: 'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/file/A*064aSK2LUPEAAAAAAAAAAAAADmJ7AQ/NotoSansCJKsc-VF.ttf',
    },
  ],
});

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvaskitRenderer,
});

(async () => {
  await canvas.ready;

  const ellipsisText = new Text({
    style: {
      fontFamily: 'Roboto',
      fontSize: 22,
      fill: '#1890FF',
      text: 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz',
      wordWrap: true,
      wordWrapWidth: 100,
      maxLines: 3,
      ellipsis: '...',
    },
  });
  ellipsisText.translate(100, 100);
  canvas.appendChild(ellipsisText);

  const decoratedText = new Text({
    style: {
      fontFamily: 'sans-serif',
      fontSize: 22,
      fill: '#1890FF',
      text: 'abcdefghijklmnopqrstuvwxyz这是测试文本',
      wordWrap: true,
      wordWrapWidth: 100,
      decorationLine: 'underline',
      decorationThickness: 1.5,
    },
  });
  decoratedText.translate(100, 300);
  canvas.appendChild(decoratedText);

  const shadowedText = new Text({
    style: {
      fontFamily: 'sans-serif',
      fontSize: 22,
      fill: '#1890FF',
      text: 'abcdefghijklmnopqrstuvwxyz这是测试文本',
      wordWrap: true,
      wordWrapWidth: 100,
      shadows: [
        {
          color: 'black',
          blurRadius: 15,
        },
        {
          color: 'red',
          blurRadius: 5,
          offset: [10, 10],
        },
      ],
    },
  });
  shadowedText.translate(300, 300);
  canvas.appendChild(shadowedText);

  // fontFeatures
  const fontFeaturesText = new Text({
    style: {
      fontFamily: 'Roboto',
      fontSize: 22,
      fill: '#1890FF',
      text: 'Difficult waffles 0O 3.14',
      fontFeatures: [
        {
          name: 'smcp',
          value: 1,
        },
        {
          name: 'zero',
          value: 1,
        },
      ],
    },
  });
  fontFeaturesText.translate(300, 100);
  canvas.appendChild(fontFeaturesText);

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

  // GUI
  const gui = new lil.GUI({ autoPlace: false });
  $wrapper.appendChild(gui.domElement);
  const folder = gui.addFolder('Paragraph');
  const config = {
    wordWrap: true,
    wordWrapWidth: 100,
    decorationLine: 'underline',
    decorationThickness: 1.5,
    decorationColor: '#1890FF',
    decorationStyle: 'solid',
    direction: 'ltr',
    fill: '#1890FF',
    backgroundColor: 'white',
    foregroundColor: '#1890FF',
    shadows: [],
    halfLeading: false,
    heightMultiplier: 1,
    letterSpacing: 0,
    wordSpacing: 0,
    disableHinting: false,
  };
  folder.addColor(config, 'fill').onChange((fill) => {
    decoratedText.style.fill = fill;
  });
  folder.addColor(config, 'backgroundColor').onChange((backgroundColor) => {
    decoratedText.style.backgroundColor = backgroundColor;
  });
  folder.addColor(config, 'foregroundColor').onChange((foregroundColor) => {
    decoratedText.style.foregroundColor = foregroundColor;
  });
  folder.add(config, 'wordWrap').onChange((wordWrap) => {
    decoratedText.style.wordWrap = wordWrap;
  });
  folder.add(config, 'wordWrapWidth', 50, 200).onChange((wordWrapWidth) => {
    decoratedText.style.wordWrapWidth = wordWrapWidth;
  });
  folder.add(config, 'heightMultiplier', 0, 5).onChange((heightMultiplier) => {
    decoratedText.style.heightMultiplier = heightMultiplier;
  });
  folder.add(config, 'letterSpacing', 0, 10).onChange((letterSpacing) => {
    decoratedText.style.letterSpacing = letterSpacing;
  });
  folder.add(config, 'wordSpacing', 0, 10).onChange((wordSpacing) => {
    decoratedText.style.wordSpacing = wordSpacing;
  });
  folder.add(config, 'disableHinting').onChange((disableHinting) => {
    decoratedText.style.disableHinting = disableHinting;
  });
  folder.add(config, 'halfLeading').onChange((halfLeading) => {
    decoratedText.style.halfLeading = halfLeading;
  });
  folder
    .add(config, 'decorationLine', [
      'none',
      'underline',
      'overline',
      'line-through',
    ])
    .onChange((decorationLine) => {
      decoratedText.style.decorationLine = decorationLine;
    });
  folder
    .add(config, 'decorationThickness', 0, 5)
    .onChange((decorationThickness) => {
      decoratedText.style.decorationThickness = decorationThickness;
    });
  folder.addColor(config, 'decorationColor').onChange((decorationColor) => {
    decoratedText.style.decorationColor = decorationColor;
  });
  folder
    .add(config, 'decorationStyle', [
      'solid',
      'double',
      'dotted',
      'dashed',
      'wavy',
    ])
    .onChange((decorationStyle) => {
      decoratedText.style.decorationStyle = decorationStyle;
    });
  folder.add(config, 'direction', ['ltr', 'rtl']).onChange((direction) => {
    decoratedText.style.direction = direction;
  });

  const strutFolder = gui.addFolder('StrutStyle');
  const strutConfig = {
    fontFamilies: ['sans-serif'],
    strutEnabled: false,
    fontSize: 22,
    heightMultiplier: 1,
    leading: 0,
    halfLeading: false,
    forceStrutHeight: false,
  };
  strutFolder.add(strutConfig, 'strutEnabled').onChange((strutEnabled) => {
    decoratedText.style.strutStyle = strutConfig;
  });
  strutFolder.add(strutConfig, 'fontSize', 10, 40).onChange((fontSize) => {
    decoratedText.style.strutStyle = strutConfig;
  });
  strutFolder
    .add(strutConfig, 'heightMultiplier', 0, 5)
    .onChange((heightMultiplier) => {
      decoratedText.style.strutStyle = strutConfig;
    });
  strutFolder
    .add(strutConfig, 'leading', 0, 10)
    .onChange((heightMultiplier) => {
      decoratedText.style.strutStyle = strutConfig;
    });
  strutFolder.add(strutConfig, 'halfLeading').onChange((halfLeading) => {
    decoratedText.style.strutStyle = strutConfig;
  });
  strutFolder.add(strutConfig, 'forceStrutHeight').onChange((halfLeading) => {
    decoratedText.style.strutStyle = strutConfig;
  });
})();
