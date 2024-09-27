import { Image, Text } from '@antv/g';
import { Plugin as PluginDragndrop } from '@antv/g-plugin-dragndrop';
export async function dragndrop(context) {
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

  const gate = new Image({
    style: {
      droppable: true,
      x: 50,
      y: 100,
      width: 200,
      height: 100,
      src: 'https://en.js.cx/clipart/soccer-gate.svg',
    },
  });

  const ball = new Image({
    style: {
      draggable: true,
      x: 300,
      y: 200,
      width: 100,
      height: 100,
      src: 'https://en.js.cx/clipart/ball.svg',
      cursor: 'pointer',
    },
  });

  canvas.appendChild(gate);
  canvas.appendChild(ball);

  const gateText = new Text({
    style: {
      x: 50,
      y: 350,
      fill: 'black',
      text: '',
      pointerEvents: 'none',
    },
  });
  const ballText = new Text({
    style: {
      x: 50,
      y: 400,
      fill: 'black',
      text: '',
      pointerEvents: 'none',
    },
  });
  canvas.appendChild(gateText);
  canvas.appendChild(ballText);

  let shiftX = 0;
  let shiftY = 0;
  function moveAt(target, canvasX, canvasY) {
    target.setPosition(canvasX - shiftX, canvasY - shiftY);
  }

  ball.addEventListener('dragstart', function (e) {
    e.target.style.opacity = 0.5;
    ballText.style.text = 'ball dragstart';

    const [x, y] = e.target.getPosition();
    shiftX = e.canvasX - x;
    shiftY = e.canvasY - y;

    moveAt(e.target, e.canvasX, e.canvasY);
  });
  ball.addEventListener('drag', function (e) {
    moveAt(e.target, e.canvasX, e.canvasY);
    ballText.style.text = `ball drag movement: ${e.dx}, ${e.dy}`;
  });
  ball.addEventListener('dragend', function (e) {
    e.target.style.opacity = 1;
    ballText.style.text = 'ball dragend';
  });

  gate.addEventListener('dragenter', function (e) {
    e.target.style.opacity = 0.6;
    gateText.style.text = 'gate dragenter';
  });
  gate.addEventListener('dragleave', function (e) {
    e.target.style.opacity = 1;
    gateText.style.text = 'gate dragleave';
  });
  gate.addEventListener('dragover', function (e) {
    e.target.style.opacity = 0.6;
    gateText.style.text = 'gate dragover';
  });
  gate.addEventListener('drop', function (e) {
    e.target.style.opacity = 1;
    gateText.style.text = 'gate drop';
  });

  // move camera
  const camera = canvas.getCamera();
  canvas.addEventListener('drag', function (e) {
    if (e.target === canvas.document) {
      camera.pan(-e.dx, -e.dy);
    }
  });
  canvas.addEventListener('drop', function (e) {
    if (e.target === canvas.document) {
      console.log('drop on document');
    }
  });
}
