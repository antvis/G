import { Ellipse } from '@antv/g';

export async function ellipse(context) {
  const { canvas } = context;
  await canvas.ready;

  const ellipse1 = new Ellipse({
    style: {
      cx: 20,
      cy: 20,
      rx: 10,
      ry: 20,
      fill: 'red',
    },
  });
  canvas.appendChild(ellipse1);

  const ellipse2 = ellipse1.cloneNode();
  ellipse2.style.stroke = 'green';
  ellipse2.style.lineWidth = 2;
  ellipse2.setPosition(20, 0);
  canvas.appendChild(ellipse2);

  // transparent
  const ellipse3 = ellipse2.cloneNode();
  ellipse3.style.fill = 'transparent';
  ellipse3.setPosition(40, 0);
  canvas.appendChild(ellipse3);

  // none fill
  const ellipse4 = ellipse2.cloneNode();
  ellipse4.style.fill = 'none';
  ellipse4.setPosition(60, 0);
  canvas.appendChild(ellipse4);

  // dashed
  const ellipse5 = ellipse2.cloneNode();
  ellipse5.style.lineDash = [2, 2];
  ellipse5.setPosition(80, 0);
  canvas.appendChild(ellipse5);

  // dashed with offset
  const ellipse6 = ellipse2.cloneNode();
  ellipse6.style.lineDash = [2, 2];
  ellipse6.style.lineDashOffset = 2;
  ellipse6.setPosition(100, 0);
  canvas.appendChild(ellipse6);

  const ellipse7 = ellipse1.cloneNode();
  ellipse7.style.opacity = 0.5;
  ellipse7.setPosition(120, 0);
  canvas.appendChild(ellipse7);

  // with shadow
  const ellipse8 = ellipse1.cloneNode();
  ellipse8.style.shadowBlur = 10;
  ellipse8.style.shadowColor = 'blue';
  ellipse8.setPosition(0, 40);
  canvas.appendChild(ellipse8);

  // with gradient
  const ellipse9 = ellipse1.cloneNode();
  ellipse9.style.fill = 'l(0) 0:#ffffff 0.5:#7ec2f3 1:#1890ff';
  ellipse9.setPosition(40, 40);
  canvas.appendChild(ellipse9);

  const ellipse10 = ellipse1.cloneNode();
  ellipse10.style.fill = 'r(0.5, 0.5, 1) 0:#ffffff 1:#1890ff';
  ellipse10.setPosition(80, 40);
  canvas.appendChild(ellipse10);

  // transform
  const ellipse11 = ellipse1.cloneNode();
  ellipse11.style.transformOrigin = 'center';
  ellipse11.style.transform = 'translate(140, 100) scale(2)';
  canvas.appendChild(ellipse11);
}
