import { Canvas, Group, Rect } from '@antv/g';

/**
 * @see https://github.com/antvis/G/issues/1915
 */
export async function issue_1915(context: { canvas: Canvas; gui: any }) {
  const { canvas, gui } = context;
  await canvas.ready;

  const rendererConfig = canvas.getConfig().renderer.getConfig();
  rendererConfig.enableRenderingOptimization = true;

  const group = new Group();
  const rect = new Rect({
    style: {
      x: 150,
      y: 150,
      width: 200,
      height: 100,
      fill: 'red',
      stroke: 'black',
    },
  });
  const clipPath = new Rect({
    style: {
      x: 100,
      y: 100,
      width: 200,
      height: 100,
      stroke: 'black',
    },
  });

  canvas.appendChild(group);
  group.appendChild(rect);
  canvas.appendChild(clipPath);

  // the clip is set on the group, the red rect only should be visible inside it
  group.style.clipPath = clipPath;

  const config = {
    enableRenderingOptimization: true,
    x: 150,
  };
  gui.add(config, 'enableRenderingOptimization').onChange((enable: boolean) => {
    rendererConfig.enableRenderingOptimization = enable;
    // draw a new frame with the other code path
    canvas.getRenderingService().dirty();
  });
  gui.add(config, 'x', 0, 400).onChange((x: number) => {
    rect.style.x = x;
  });
}
