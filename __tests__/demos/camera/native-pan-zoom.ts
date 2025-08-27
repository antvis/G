import { Circle, Group } from '@antv/g';

export async function nativePanZoom(context) {
  const { canvas } = context;
  await canvas.ready;

  const group = new Group({
    id: 'group',
  });

  const circle1 = new Circle({
    style: {
      cx: 100,
      cy: 100,
      r: 50,
      fill: 'red',
    },
  });

  const circle2 = new Circle({
    style: {
      cx: 300,
      cy: 100,
      r: 50,
      fill: 'blue',
    },
  });

  canvas.appendChild(group);
  group.appendChild(circle1);
  group.appendChild(circle2);

  const camera = canvas.getCamera();
  const container = canvas.getContextService().getDomElement();

  let dragging = false;
  let lastPosition = { x: 0, y: 0 };

  container.addEventListener('mousedown', (e) => {
    dragging = true;
    lastPosition = { x: e.clientX, y: e.clientY };
  });

  container.addEventListener('mousemove', (e) => {
    if (dragging) {
      const dx = e.clientX - lastPosition.x;
      const dy = e.clientY - lastPosition.y;
      camera.pan(dx, dy);
      lastPosition = { x: e.clientX, y: e.clientY };
    }
  });

  container.addEventListener('mouseup', () => {
    dragging = false;
  });

  container.addEventListener('mouseleave', () => {
    dragging = false;
  });

  container.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const zoom = camera.getZoom();
      const ratio = e.deltaY > 0 ? 0.9 : 1.1;
      camera.setZoomByViewportPoint(zoom * ratio, [e.clientX, e.clientY]);
    },
    {
      passive: false,
    },
  );
}
