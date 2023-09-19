import { Canvas, CanvasEvent, Circle, Path } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import * as d3 from 'd3';

const arc = d3.arc();
const arc1 = arc({
  innerRadius: 150,
  outerRadius: 180,
  startAngle: Math.PI / 4,
  endAngle: Math.PI / 2,
  padAngle: Math.PI / 200,
});
const arc2 = arc({
  innerRadius: 150,
  outerRadius: 180,
  startAngle: 0,
  endAngle: Math.PI / 4,
  padAngle: Math.PI / 200,
});
const arc3 = arc({
  innerRadius: 150,
  outerRadius: 180,
  startAngle: Math.PI / 2,
  endAngle: Math.PI * 2,
  padAngle: Math.PI / 200,
});

const canvasRenderer = new CanvasRenderer();

const canvas = new Canvas({
  container: 'container',
  width: 400,
  height: 400,
  renderer: canvasRenderer,
});

const circle = new Circle({
  style: {
    cx: 200,
    cy: 200,
    r: 100,
    fill: 'red',
    stroke: 'white',
    lineWidth: 4,
    shadowColor: 'red',
    shadowBlur: 2,
    cursor: 'pointer',
  },
});

[arc1, arc2, arc3].forEach((arc, i) => {
  console.log(arc);

  const p = new Path({
    style: {
      d: arc,
      // shadowColor: "blue",
      // shadowBlur: 20,
    },
  });
  p.style.fill = `radial-gradient(circle at 0px 0px, blue 60%, rgba(0,0,200,0.3) 75%, rgba(0,0,200,0.3) 76%, blue 90%)`;
  canvas.appendChild(p);
  p.translate(200, 200);
});

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(circle);

  circle.animate([{ shadowBlur: 20 }, { shadowBlur: 60 }], {
    duration: 2000,
    fill: 'both',
    direction: 'alternate',
    easing: 'ease-in-out',
    iterations: Infinity,
  });
});
