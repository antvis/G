import { Rect, HTML, Line } from '@antv/g';

export async function gradient(context) {
  const { canvas } = context;
  await canvas.ready;
  // single linear gradient
  const rect1 = new Rect({
    style: {
      x: 50,
      y: 50,
      width: 200,
      height: 100,
      fill: 'linear-gradient(0deg, blue, green 40%, red)',
      // transform: 'translate(50, 50)',
    },
  });

  // multi linear gradients
  const rect2 = new Rect({
    style: {
      x: 50,
      y: 250,
      width: 200,
      height: 100,
      fill: `linear-gradient(217deg, rgba(255,0,0,.8), rgba(255,0,0,0) 70.71%),
              linear-gradient(127deg, rgba(0,255,0,.8), rgba(0,255,0,0) 70.71%),
              linear-gradient(336deg, rgba(0,0,255,.8), rgba(0,0,255,0) 70.71%)`,
      // transform: 'translate(50, 250)',
    },
  });

  // single radial gradient
  const rect3 = new Rect({
    style: {
      x: 350,
      y: 50,
      width: 200,
      height: 100,
      fill: 'radial-gradient(circle at center, red, blue, green 100%)',
      // transform: 'translate(350, 50)',
    },
  });

  // hard stop
  const rect4 = new Rect({
    style: {
      x: 350,
      y: 250,
      width: 200,
      height: 100,
      fill: 'radial-gradient(red 50%, blue 50%)',
      // transform: 'translate(350, 250)',
    },
  });

  const line1 = new Line({
    style: {
      x1: 50,
      y1: 180,
      x2: 250,
      y2: 180,
      lineWidth: 10,
      stroke: 'linear-gradient(0deg, blue, green 40%, red)',
    },
  });
  const line2 = new Line({
    style: {
      x1: 350,
      y1: 180,
      x2: 550,
      y2: 180,
      lineWidth: 10,
      stroke: 'radial-gradient(circle at center, red, blue, green 100%)',
    },
  });

  canvas.appendChild(line1);
  canvas.appendChild(line2);

  canvas.appendChild(rect1);
  canvas.appendChild(rect2);
  canvas.appendChild(rect3);
  canvas.appendChild(rect4);

  canvas.appendChild(
    new HTML({
      style: {
        x: 100,
        y: 20,
        height: 30,
        width: 200,
        innerHTML: 'linear gradient',
      },
    }),
  );
  canvas.appendChild(
    new HTML({
      style: {
        x: 60,
        y: 220,
        height: 30,
        width: 200,
        innerHTML: 'multiple linear gradients',
      },
    }),
  );
  canvas.appendChild(
    new HTML({
      style: {
        x: 350,
        y: 20,
        height: 30,
        width: 200,
        innerHTML: 'radial gradient',
      },
    }),
  );
  canvas.appendChild(
    new HTML({
      style: {
        x: 350,
        y: 220,
        height: 30,
        width: 200,
        innerHTML: 'hard color stop',
      },
    }),
  );
}
