import { Path, Circle, Line } from '@antv/g';

export async function marker(context) {
  const { canvas } = context;
  await canvas.ready;

  /**
   * Arrow with triangle marker
   */
  const arrowMarker = new Path({
    style: {
      d: 'M 10,10 L -10,0 L 10,-10 Z',
      stroke: '#1890FF',
      transformOrigin: 'center',
    },
  });
  const handle1 = new Circle({
    id: 'handle1',
    style: {
      draggable: true,
      cursor: 'move',
      fill: '#DEE9FF',
      stroke: '#5B8FF9',
      r: 10,
      cx: 100,
      cy: 50,
    },
  });
  const handle2 = handle1.cloneNode();
  handle2.id = 'handle2';
  handle2.style.cx = 300;
  handle2.style.cy = 50;
  const arrow1 = new Line({
    style: {
      x1: 100,
      y1: 50,
      x2: 300,
      y2: 50,
      stroke: '#F6BD16',
      lineWidth: 6,
      markerEnd: arrowMarker,
      // markerEndOffset: 28,
    },
  });

  // /**
  //  * Arrow with rect marker
  //  */
  // const rectMarker = new Rect({
  //   style: {
  //     x: -10,
  //     y: -10,
  //     width: 20,
  //     height: 20,
  //     fill: '#F6BD16',
  //     transform: 'rotate(45deg)',
  //     transformOrigin: 'center',
  //   },
  // });
  // const handle3 = handle1.cloneNode();
  // handle3.id = 'handle3';
  // handle3.style.cx = 100;
  // handle3.style.cy = 150;
  // const handle4 = handle1.cloneNode();
  // handle4.id = 'handle4';
  // handle4.style.cx = 300;
  // handle4.style.cy = 150;
  // const arrow2 = new Line({
  //   style: {
  //     x1: 100,
  //     y1: 150,
  //     x2: 300,
  //     y2: 150,
  //     stroke: '#F6BD16',
  //     lineWidth: 6,
  //     markerEnd: rectMarker,
  //     markerEndOffset: 28,
  //   },
  // });

  // /**
  //  * Arrow with image marker
  //  */
  // const imageMarker = new Image({
  //   style: {
  //     x: -25,
  //     y: -25,
  //     width: 50,
  //     height: 50,
  //     src: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
  //     transformOrigin: 'center',
  //     transform: 'rotate(90deg)',
  //   },
  // });
  // const handle5 = handle1.cloneNode();
  // handle5.id = 'handle5';
  // handle5.style.cx = 100;
  // handle5.style.cy = 250;
  // const handle6 = handle1.cloneNode();
  // handle6.id = 'handle6';
  // handle6.style.cx = 300;
  // handle6.style.cy = 250;
  // const arrow3 = new Line({
  //   style: {
  //     x1: 100,
  //     y1: 250,
  //     x2: 300,
  //     y2: 250,
  //     stroke: '#F6BD16',
  //     lineWidth: 6,
  //     markerEnd: imageMarker,
  //     markerEndOffset: 40,
  //   },
  // });

  canvas.appendChild(arrow1);
  canvas.appendChild(handle1);
  canvas.appendChild(handle2);

  // canvas.appendChild(arrow2);
  // canvas.appendChild(handle3);
  // canvas.appendChild(handle4);

  // canvas.appendChild(arrow3);
  // canvas.appendChild(handle5);
  // canvas.appendChild(handle6);

  let shiftX = 0;
  let shiftY = 0;
  function moveAt(target, canvasX, canvasY) {
    const newPosX = canvasX - shiftX;
    const newPosY = canvasY - shiftY;
    target.style.cx = newPosX;
    target.style.cy = newPosY;

    // re-define arrow
    if (target.id === 'handle1') {
      arrow1.style.x1 = newPosX;
      arrow1.style.y1 = newPosY;
    } else if (target.id === 'handle2') {
      arrow1.style.x2 = newPosX;
      arrow1.style.y2 = newPosY;
      // } else if (target.id === 'handle3') {
      //   arrow2.style.x1 = newPosX;
      //   arrow2.style.y1 = newPosY;
      // } else if (target.id === 'handle4') {
      //   arrow2.style.x2 = newPosX;
      //   arrow2.style.y2 = newPosY;
      // } else if (target.id === 'handle5') {
      //   arrow3.style.x1 = newPosX;
      //   arrow3.style.y1 = newPosY;
      // } else if (target.id === 'handle6') {
      //   arrow3.style.x2 = newPosX;
      //   arrow3.style.y2 = newPosY;
    }
  }

  canvas.addEventListener('dragstart', function (e) {
    const { cx, cy } = e.target.style;
    shiftX = e.canvasX - cx;
    shiftY = e.canvasY - cy;

    moveAt(e.target, e.canvasX, e.canvasY);
  });
  canvas.addEventListener('drag', function (e) {
    moveAt(e.target, e.canvasX, e.canvasY);
  });
}
