import { Circle } from '@antv/g';

export async function camera(context) {
  const { canvas } = context;
  await canvas.ready;

  const circle = new Circle({
    style: {
      cx: 10,
      cy: 10,
      r: 10,
      fill: 'red',
    },
  });

  canvas.appendChild(circle);

  const camera = canvas.getCamera();

  const landmark = camera.createLandmark('camera', {
    position: [200, 200, 500],
    focalPoint: [200, 200, 0],
  });

  camera.gotoLandmark(landmark, { duration: 0 });
}
