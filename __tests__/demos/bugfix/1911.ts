import { Canvas, Text, Rect, CanvasEvent } from '@antv/g';
import { Renderer as SVGRenderer } from '@antv/g-svg';

/**
 * @see https://github.com/antvis/G/issues/1911
 */
export async function issue_1911(context) {
  const { canvas, gui } = context;
  await canvas.ready;

  canvas.setRenderer(new SVGRenderer());

  const text = new Text({
    style: {
      x: 100,
      y: 100,
      text: '这是测试文本This is text',
      textBaseline: 'bottom',
      fontSize: 40,
      textAlign: 'left',
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 5,
    },
  });
  const textLine3 = new Text({
    style: {
      x: 100,
      y: 300,
      text: '这是测试文本2  This is text in line 3',
      textBaseline: 'bottom',
      wordWrap: true,
      wordWrapWidth: 360,
      fontSize: 40,
      textAlign: 'left',
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 5,
    },
  });
  const bounds = new Rect({
    style: {
      width: 0,
      height: 0,
      stroke: 'black',
      lineWidth: 2,
    },
  });
  const bounds1 = new Rect({
    style: {
      width: 0,
      height: 0,
      stroke: 'black',
      lineWidth: 2,
    },
  });
  canvas.appendChild(text);
  canvas.appendChild(textLine3);
  canvas.appendChild(bounds);
  canvas.appendChild(bounds1);

  canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
    const bounding = text.getBounds();
    const bounding1 = textLine3.getBounds();
    if (bounding) {
      const { center, halfExtents } = bounding;
      bounds.attr('width', halfExtents[0] * 2);
      bounds.attr('height', halfExtents[1] * 2);
      bounds.setPosition(
        center[0] - halfExtents[0],
        center[1] - halfExtents[1],
      );
    }
    if (bounding1) {
      const { center, halfExtents } = bounding1;
      bounds1.attr('width', halfExtents[0] * 2);
      bounds1.attr('height', halfExtents[1] * 2);
      bounds1.setPosition(
        center[0] - halfExtents[0],
        center[1] - halfExtents[1],
      );
    }
  });

  const folder = gui.addFolder('textBaseline');
  const config = { textBaseline: 'bottom' };
  folder
    .add(config, 'textBaseline', ['top', 'middle', 'bottom'])
    .onChange((name) => {
      text.attr('textBaseline', name);
      textLine3.attr('textBaseline', name);
    });

  const dxyFolder = folder.addFolder('dx, dy');
  const dxyConfig = { dx: 0, dy: 0 };
  dxyFolder.add(dxyConfig, 'dx', -100, 100).onChange((dx) => {
    text.attr('dx', dx);
    textLine3.attr('dx', dx);
  });
  dxyFolder.add(dxyConfig, 'dy', -100, 100).onChange((dy) => {
    text.attr('dy', dy);
    textLine3.attr('dy', dy);
  });
}
