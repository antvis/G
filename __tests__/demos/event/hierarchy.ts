import { Circle, Path } from '@antv/g';

export async function hierarchy(context) {
  const { canvas } = context;
  await canvas.ready;

  const path = new Path({
    style: {
      stroke: 'red',
      fill: 'blue',
      fillOpacity: 0.5,
      d: 'M304,42A168,168,0,0,1,459.4210205078125,273.78399658203125L352.5690002441406,229.93299865722656A52.5,52.5,0,0,0,304,157.5Z',
      transformOrigin: 'center center',
      // transform: 'translate(304, 210)'
    },
  });
  canvas.appendChild(path);
  path.addEventListener('mouseenter', () => {
    path.style.transform = 'scale(1.2)';
  });
  path.addEventListener('mouseleave', () => {
    path.style.transform = 'none';
  });

  const path2 = new Path({
    style: {
      stroke: 'red',
      fill: 'blue',
      fillOpacity: 0.5,
      d: 'M 200 200 L 200 100 L 300 100 Z',
      transformOrigin: 'center center',
      transform: 'translate(0, 100)',
    },
  });
  canvas.appendChild(path2);
  const circle4 = new Circle({
    style: {
      cx: 200,
      cy: 200,
      r: 20,
      fill: 'red',
    },
  });
  path2.appendChild(circle4);
  path2.addEventListener('mouseenter', () => {
    circle4.style.fill = 'green';
  });
  path2.addEventListener('mouseleave', () => {
    circle4.style.fill = 'red';
  });
}
