import { Circle, Rect, Group } from '@antv/g';

export async function transform(context) {
  const { canvas } = context;
  await canvas.ready;

  const circle1 = new Circle({
    style: {
      cx: 100,
      cy: 100,
      r: 50,
      fill: 'green',
      transform: 'scale(2)',
    },
  });
  canvas.appendChild(circle1);

  const group = new Group({
    style: {
      transform: 'translate(100, 100)',
    },
  });
  const circle2 = new Circle({
    style: {
      r: 50,
      fill: 'red',
    },
  });
  group.appendChild(circle2);
  group.scale(0.5);
  canvas.appendChild(group);

  /**
  solarSystem
     |    |
     |   sun
     |
   earthOrbit
     |    |
     |  earth
     |
    moonOrbit
        |
       moon
   */

  const solarSystem = new Group({
    id: 'solarSystem',
  });
  const earthOrbit = new Group({
    id: 'earthOrbit',
  });
  const moonOrbit = new Group({
    id: 'moonOrbit',
  });

  const sun = new Circle({
    id: 'sun',
    style: {
      r: 100,
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
    },
  });
  const earth = new Circle({
    id: 'earth',
    style: {
      r: 50,
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
    },
  });
  const moon = new Circle({
    id: 'moon',
    style: {
      r: 25,
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
    },
  });

  solarSystem.appendChild(sun);
  solarSystem.appendChild(earthOrbit);
  earthOrbit.appendChild(earth);
  earthOrbit.appendChild(moonOrbit);
  moonOrbit.appendChild(moon);

  solarSystem.setPosition(300, 250);
  earthOrbit.translate(100, 0);
  moonOrbit.translate(100, 0);

  canvas.appendChild(solarSystem);

  // canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
  //   solarSystem.rotateLocal(1);
  //   earthOrbit.rotateLocal(2);
  // });

  const rect = new Rect({
    style: {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      fill: 'red',
      transform: 'translate(100, 200)',
    },
  });
  canvas.appendChild(rect);
  const circle3 = new Circle({
    style: {
      cx: 0,
      cy: 0,
      r: 20,
      fill: 'blue',
    },
  });
  rect.appendChild(circle3);
}
