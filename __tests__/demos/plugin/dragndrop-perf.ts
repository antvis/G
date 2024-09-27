import { Circle } from '@antv/g';
import { Plugin as PluginDragndrop } from '@antv/g-plugin-dragndrop';
export async function dragndropPerf(context) {
  const { canvas, renderer } = context;

  renderer.registerPlugin(
    new PluginDragndrop({
      // we can drag the whole document from empty space now!
      isDocumentDraggable: true,
      isDocumentDroppable: true,
      dragstartDistanceThreshold: 10,
      dragstartTimeThreshold: 100,
    }),
  );

  await canvas.ready;

  const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'cyan', 'purple'];
  for (let i = 0; i < 10000; i++) {
    const circle = new Circle({
      style: {
        cx: Math.random() * 600,
        cy: Math.random() * 500,
        r: 6,
        fill: colors[i % colors.length],
        draggable: true,
      },
    });
    canvas.appendChild(circle);
  }

  let shiftX = 0;
  let shiftY = 0;
  function moveAt(target, canvasX, canvasY) {
    target.setPosition(canvasX - shiftX, canvasY - shiftY);
  }

  canvas.addEventListener('dragstart', function (e) {
    const [x, y] = e.target.getPosition();
    shiftX = e.canvasX - x;
    shiftY = e.canvasY - y;

    moveAt(e.target, e.canvasX, e.canvasY);
  });
  canvas.addEventListener('drag', function (e) {
    moveAt(e.target, e.canvasX, e.canvasY);
  });
}
