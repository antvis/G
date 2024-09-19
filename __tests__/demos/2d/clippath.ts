import { Circle, Rect, Path, Group } from '@antv/g';
import { Sector } from '@antv/g-components';

export async function clipPath(context) {
  const { canvas } = context;
  await canvas.ready;

  // in user space
  const clipPathCircle = new Circle({
    style: {
      cx: 150,
      cy: 150,
      r: 35,
      fill: 'blue',
      transformOrigin: 'center',
    },
  });

  const rect1 = new Rect({
    style: {
      x: 0,
      y: 0,
      width: 45,
      height: 45,
      stroke: 'white',
      lineWidth: 2,
      fill: 'red',
      clipPath: clipPathCircle,
      cursor: 'pointer',
      // transform: 'translate(200px, 200px)',
    },
  });
  const rect2 = rect1.cloneNode();
  rect2.style.y = 55;
  const rect3 = rect1.cloneNode();
  rect3.style.x = 55;
  rect3.style.y = 55;
  const rect4 = rect1.cloneNode();
  rect4.style.x = 55;
  rect4.style.y = 0;

  const clipPathRect = new Rect({
    style: {
      x: 125,
      y: 125,
      width: 50,
      height: 50,
    },
  });
  const clipPath = new Path({
    style: {
      stroke: 'black',
      lineWidth: 2,
      d: 'M 10,10 L -10,0 L 10,-10 Z',
    },
  });

  const g = new Group();
  const group = new Group({
    style: {
      transform: 'translate(100, 100)',
    },
  });
  g.appendChild(clipPathCircle);
  group.appendChild(rect1);
  group.appendChild(rect2);
  group.appendChild(rect3);
  group.appendChild(rect4);
  g.appendChild(group);

  canvas.appendChild(g);

  // clipPathCircle.animate(
  //   [{ transform: 'scale(1)' }, { transform: 'scale(2)' }],
  //   {
  //     duration: 1500,
  //     iterations: Infinity,
  //   },
  // );

  {
    const sector = new Sector({
      style: {
        x: 350,
        y: 100,
        lineWidth: 1,
        sr: 100,
        startAngle: -90,
        fill: 'yellow',
        opacity: 0.5,
        endAngle: -270,
      },
    });
    const group = new Group({
      style: {
        clipPath: sector,
      },
    });
    const circle1 = new Circle({
      style: {
        fill: 'red',
        cx: 300,
        cy: 100,
        r: 20,
      },
    });
    const circle2 = new Circle({
      style: {
        fill: 'red',
        cx: 350,
        cy: 100,
        r: 20,
      },
    });
    canvas.appendChild(group);
    group.appendChild(circle1);
    group.appendChild(circle2);
    canvas.appendChild(sector);

    // sector.animate(
    //   [
    //     {
    //       endAngle: -90,
    //     },
    //     {
    //       endAngle: 270,
    //     },
    //   ],
    //   {
    //     duration: 1000,
    //     iterations: Infinity,
    //     fill: 'both',
    //   },
    // );
  }
}
