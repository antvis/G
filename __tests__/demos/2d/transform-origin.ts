import { Circle, Line, Group } from '@antv/g';

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform-origin
 */
export async function transformOrigin(context) {
  const { canvas } = context;
  await canvas.ready;

  {
    /**
     * reference image
     */
    const circle1 = new Circle({
      style: {
        cx: 100,
        cy: 100,
        r: 100,
        fill: 'black',
      },
    });
    const line1 = new Line({
      style: {
        x1: 100,
        y1: 0,
        x2: 100,
        y2: 200,
        stroke: 'rebeccapurple',
        lineWidth: 2,
      },
    });
    const line2 = new Line({
      style: {
        x1: 0,
        y1: 100,
        x2: 200,
        y2: 100,
        stroke: 'rebeccapurple',
        lineWidth: 2,
      },
    });
    const circle2 = new Circle({
      style: {
        cx: 100,
        cy: 100,
        r: 75,
        fill: 'blue',
      },
    });
    const line3 = new Line({
      style: {
        x1: 100,
        y1: 25,
        x2: 100,
        y2: 175,
        stroke: 'rebeccapurple',
        lineWidth: 1.5,
      },
    });
    const line4 = new Line({
      style: {
        x1: 25,
        y1: 100,
        x2: 175,
        y2: 100,
        stroke: 'rebeccapurple',
        lineWidth: 1.5,
      },
    });
    const circle3 = new Circle({
      style: {
        cx: 100,
        cy: 100,
        r: 50,
        fill: 'red',
      },
    });
    const line5 = new Line({
      style: {
        x1: 100,
        y1: 50,
        x2: 100,
        y2: 150,
        stroke: 'rebeccapurple',
        lineWidth: 1,
      },
    });
    const line6 = new Line({
      style: {
        x1: 50,
        y1: 100,
        x2: 150,
        y2: 100,
        stroke: 'rebeccapurple',
        lineWidth: 1,
      },
    });
    const circle4 = new Circle({
      style: {
        cx: 100,
        cy: 100,
        r: 25,
        fill: 'yellow',
      },
    });
    const line7 = new Line({
      style: {
        x1: 100,
        y1: 75,
        x2: 100,
        y2: 125,
        stroke: 'rebeccapurple',
        lineWidth: 0.5,
      },
    });
    const line8 = new Line({
      style: {
        x1: 75,
        y1: 100,
        x2: 125,
        y2: 100,
        stroke: 'rebeccapurple',
        lineWidth: 0.5,
      },
    });
    canvas.appendChild(circle1);
    canvas.appendChild(line1);
    canvas.appendChild(line2);
    canvas.appendChild(circle2);
    canvas.appendChild(line3);
    canvas.appendChild(line4);
    canvas.appendChild(circle3);
    canvas.appendChild(line5);
    canvas.appendChild(line6);
    canvas.appendChild(circle4);
    canvas.appendChild(line7);
    canvas.appendChild(line8);
  }

  {
    /**
     * Transformation with transform-origin
     */
    const group = new Group({
      style: {
        transform: 'translate(300, 0)',
      },
    });
    const circle1 = new Circle({
      style: {
        cx: 100,
        cy: 100,
        r: 100,
        fill: 'black',
      },
    });
    const line1 = new Line({
      style: {
        x1: 100,
        y1: 0,
        x2: 100,
        y2: 200,
        stroke: 'rebeccapurple',
        lineWidth: 2,
      },
    });
    const line2 = new Line({
      style: {
        x1: 0,
        y1: 100,
        x2: 200,
        y2: 100,
        stroke: 'rebeccapurple',
        lineWidth: 2,
      },
    });
    const group1 = new Group();
    group1.appendChild(circle1);
    group1.appendChild(line1);
    group1.appendChild(line2);

    const group2 = group1.cloneNode(true);
    group2.childNodes[0].style.fill = 'blue';
    group2.style.transform = 'scale(0.75, 0.75)';
    group2.style.transformOrigin = '100 100';

    const group3 = group1.cloneNode(true);
    group3.childNodes[0].style.fill = 'red';
    group3.style.transform = 'scale(0.5, 0.5)';
    group3.style.transformOrigin = '100 100';

    const group4 = group1.cloneNode(true);
    group4.childNodes[0].style.fill = 'yellow';
    group4.style.transform = 'scale(0.25, 0.25)';
    group4.style.transformOrigin = '100 100';

    group.appendChild(group1);
    group.appendChild(group2);
    group.appendChild(group3);
    group.appendChild(group4);
    canvas.appendChild(group);
  }

  {
    /**
     * Transformation without transform-origin
     */
    const group = new Group({
      style: {
        transform: 'translate(0, 300)',
      },
    });
    const circle1 = new Circle({
      style: {
        cx: 100,
        cy: 100,
        r: 100,
        fill: 'black',
      },
    });
    const line1 = new Line({
      style: {
        x1: 100,
        y1: 0,
        x2: 100,
        y2: 200,
        stroke: 'rebeccapurple',
        lineWidth: 2,
      },
    });
    const line2 = new Line({
      style: {
        x1: 0,
        y1: 100,
        x2: 200,
        y2: 100,
        stroke: 'rebeccapurple',
        lineWidth: 2,
      },
    });
    const group1 = new Group();
    group1.appendChild(circle1);
    group1.appendChild(line1);
    group1.appendChild(line2);

    const group2 = group1.cloneNode(true);
    group2.childNodes[0].style.fill = 'blue';
    group2.style.transform =
      'translate(100,100) scale(0.75,0.75) translate(-100,-100)';

    const group3 = group1.cloneNode(true);
    group3.childNodes[0].style.fill = 'red';
    group3.style.transform =
      'translate(100,100) scale(0.5,0.5) translate(-100,-100)';

    const group4 = group1.cloneNode(true);
    group4.childNodes[0].style.fill = 'yellow';
    group4.style.transform =
      'translate(100,100) scale(0.25,0.25) translate(-100,-100)';

    group.appendChild(group1);
    group.appendChild(group2);
    group.appendChild(group3);
    group.appendChild(group4);
    canvas.appendChild(group);
  }
}
