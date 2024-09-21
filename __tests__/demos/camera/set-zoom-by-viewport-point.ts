import { Circle } from '@antv/g';
import type { Camera, FederatedWheelEvent } from '@antv/g';

export async function setZoomByViewportPoint(context) {
  const { canvas } = context;
  await canvas.ready;

  const circle = new Circle({
    style: {
      cx: 100,
      cy: 100,
      r: 50,
      fill: 'red',
    },
  });

  canvas.appendChild(circle);

  const camera: Camera = canvas.getCamera();

  canvas.addEventListener('wheel', (event: FederatedWheelEvent) => {
    const {
      viewport: { x, y },
      deltaY,
    } = event;

    const zoom = camera.getZoom();
    const ratio = deltaY > 0 ? 0.9 : 1.1;

    camera.setZoomByViewportPoint(zoom * ratio, [x, y]);
  });
}
