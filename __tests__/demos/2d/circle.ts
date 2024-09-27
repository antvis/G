import { Circle } from '@antv/g';

export async function circle(context) {
  const { canvas } = context;
  await canvas.ready;

  const circle1 = new Circle({
    style: {
      cx: 10,
      cy: 10,
      r: 10,
      fill: 'red',
    },
  });
  canvas.appendChild(circle1);

  const circle2 = circle1.cloneNode();
  circle2.style.stroke = 'green';
  circle2.style.lineWidth = 2;
  circle2.style.transform = 'translate(20px, 0)';
  canvas.appendChild(circle2);

  // transparent
  const circle3 = circle2.cloneNode();
  circle3.style.fill = 'transparent';
  circle3.setPosition(40, 0);
  canvas.appendChild(circle3);

  // none fill
  const circle4 = circle2.cloneNode();
  circle4.style.fill = 'none';
  circle4.setPosition(60, 0);
  canvas.appendChild(circle4);

  // dashed
  const circle5 = circle2.cloneNode();
  circle5.style.lineDash = [2, 2];
  circle5.setPosition(80, 0);
  canvas.appendChild(circle5);

  // dashed with offset
  const circle6 = circle2.cloneNode();
  circle6.style.lineDash = [2, 2];
  circle6.style.lineDashOffset = 2;
  circle6.setPosition(100, 0);
  canvas.appendChild(circle6);

  const circle7 = circle1.cloneNode();
  circle7.style.opacity = 0.5;
  circle7.setPosition(120, 0);
  canvas.appendChild(circle7);

  // with shadow
  const circle8 = circle1.cloneNode();
  circle8.style.cx = 0;
  circle8.style.cy = 0;
  circle8.style.r = 20;
  circle8.style.shadowBlur = 10;
  circle8.style.shadowColor = 'blue';
  circle8.setPosition(20, 60);
  canvas.appendChild(circle8);

  // with gradient
  const circle9 = circle1.cloneNode();
  circle9.style.cx = 20;
  circle9.style.cy = 20;
  circle9.style.r = 20;
  circle9.style.fill = 'l(0) 0:#ffffff 0.5:#7ec2f3 1:#1890ff';
  circle9.setPosition(40, 40);
  canvas.appendChild(circle9);
  const circle10 = circle1.cloneNode();
  circle10.style.cx = 20;
  circle10.style.cy = 20;
  circle10.style.r = 20;
  circle10.style.fill = 'r(0.5, 0.5, 1) 0:#ffffff 1:#1890ff';
  circle10.setPosition(80, 40);
  canvas.appendChild(circle10);

  // transform
  const circle11 = circle1.cloneNode();
  circle11.style.transformOrigin = 'center';
  circle11.style.transform = 'translate(130, 50) scale(2)';
  canvas.appendChild(circle11);
}
