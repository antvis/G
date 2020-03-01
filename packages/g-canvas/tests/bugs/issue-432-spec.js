const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import { getTextColorCount } from '../get-color';
import { simulateMouseEvent, getClientPoint } from '../util';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#432', () => {
  const canvas = new Canvas({
    container: dom,
    width: 1000,
    height: 1000,
    pixelRatio: 1,
  });

  const context = canvas.get('context');
  const el = canvas.get('el');

  it('default arrow for Line should be rendered and hit when localRefresh is true', (done) => {
    const line = canvas.addShape('line', {
      attrs: {
        x1: 100,
        y1: 100,
        x2: 200,
        y2: 100,
        stroke: 'red',
        startArrow: true,
        endArrow: true,
      },
    });

    setTimeout(() => {
      expect(getTextColorCount(context, 100, 96, 20, '#ff0000') > 0).eqls(true);

      let clickCalled = false;
      line.on('click', () => {
        clickCalled = true;
      });
      const { clientX, clientY } = getClientPoint(
        canvas,
        100 + 10 * Math.cos(Math.PI / 6),
        100 - 10 * Math.sin(Math.PI / 6)
      );
      simulateMouseEvent(el, 'mousedown', {
        clientX,
        clientY,
      });
      simulateMouseEvent(el, 'mouseup', {
        clientX,
        clientY,
      });
      expect(clickCalled).eqls(true);

      done();
    }, 25);
  });

  it('customized arrow for Line should be rendered and hit when localRefresh is true', (done) => {
    const line = canvas.addShape('line', {
      attrs: {
        x1: 200,
        y1: 200,
        x2: 300,
        y2: 200,
        stroke: 'red',
        startArrow: {
          path: 'M 10,10 L 0,0 L 10,-10',
        },
        endArrow: {
          path: 'M 10,10 L 0,0 L 10,-10',
        },
      },
    });

    setTimeout(() => {
      expect(getTextColorCount(context, 200, 196, 20, '#ff0000') > 0).eqls(true);

      let clickCalled = false;
      line.on('click', () => {
        clickCalled = true;
      });
      const { clientX, clientY } = getClientPoint(canvas, 200 + 10, 200 - 10);
      simulateMouseEvent(el, 'mousedown', {
        clientX,
        clientY,
      });
      simulateMouseEvent(el, 'mouseup', {
        clientX,
        clientY,
      });
      expect(clickCalled).eqls(true);

      done();
    }, 25);
  });

  it('default arrow for Polyline should be rendered and hit when localRefresh is true', (done) => {
    const polyline = canvas.addShape('polyline', {
      attrs: {
        points: [
          [250, 250],
          [300, 250],
          [300, 300],
          [350, 300],
          [350, 350],
          [400, 350],
        ],
        stroke: 'red',
        startArrow: true,
        endArrow: true,
      },
    });

    setTimeout(() => {
      expect(getTextColorCount(context, 250, 246, 20, '#ff0000') > 0).eqls(true);

      let clickCalled = false;
      polyline.on('click', () => {
        clickCalled = true;
      });
      const { clientX, clientY } = getClientPoint(
        canvas,
        250 + 10 * Math.cos(Math.PI / 6),
        250 - 10 * Math.sin(Math.PI / 6)
      );
      simulateMouseEvent(el, 'mousedown', {
        clientX,
        clientY,
      });
      simulateMouseEvent(el, 'mouseup', {
        clientX,
        clientY,
      });
      expect(clickCalled).eqls(true);

      done();
    }, 25);
  });

  it('customized arrow for Polyline should be rendered and hit when localRefresh is true', (done) => {
    const polyline = canvas.addShape('polyline', {
      attrs: {
        points: [
          [150, 250],
          [200, 250],
          [200, 300],
          [250, 300],
          [250, 350],
          [300, 350],
        ],
        stroke: 'red',
        startArrow: {
          path: 'M 10,10 L 0,0 L 10,-10',
        },
        endArrow: {
          path: 'M 10,10 L 0,0 L 10,-10',
        },
      },
    });

    setTimeout(() => {
      expect(getTextColorCount(context, 150, 246, 20, '#ff0000') > 0).eqls(true);

      let clickCalled = false;
      polyline.on('click', () => {
        clickCalled = true;
      });
      const { clientX, clientY } = getClientPoint(canvas, 150 + 10, 250 - 10);
      simulateMouseEvent(el, 'mousedown', {
        clientX,
        clientY,
      });
      simulateMouseEvent(el, 'mouseup', {
        clientX,
        clientY,
      });
      expect(clickCalled).eqls(true);

      done();
    }, 25);
  });

  it('default arrow for Path should be rendered and hit when localRefresh is true', (done) => {
    const path = canvas.addShape('path', {
      attrs: {
        path: [
          ['M', 100, 800],
          ['L', 300, 800],
          ['L', 200, 900],
          ['L', 400, 900],
        ],
        stroke: 'red',
        startArrow: true,
        endArrow: true,
      },
    });

    setTimeout(() => {
      expect(getTextColorCount(context, 100, 796, 20, '#ff0000') > 0).eqls(true);

      let clickCalled = false;
      path.on('click', () => {
        clickCalled = true;
      });
      const { clientX, clientY } = getClientPoint(
        canvas,
        100 + 10 * Math.cos(Math.PI / 6),
        800 - 10 * Math.sin(Math.PI / 6)
      );
      simulateMouseEvent(el, 'mousedown', {
        clientX,
        clientY,
      });
      simulateMouseEvent(el, 'mouseup', {
        clientX,
        clientY,
      });
      expect(clickCalled).eqls(true);

      done();
    }, 25);
  });

  it('customized arrow for Path should be rendered and hit when localRefresh is true', (done) => {
    const path = canvas.addShape('path', {
      attrs: {
        path: [
          ['M', 500, 800],
          ['L', 700, 800],
          ['L', 600, 900],
          ['L', 800, 900],
        ],
        stroke: 'red',
        startArrow: {
          path: 'M 10,10 L 0,0 L 10,-10',
        },
        endArrow: {
          path: 'M 10,10 L 0,0 L 10,-10',
        },
      },
    });

    setTimeout(() => {
      expect(getTextColorCount(context, 500, 796, 20, '#ff0000') > 0).eqls(true);

      let clickCalled = false;
      path.on('click', () => {
        clickCalled = true;
      });
      const { clientX, clientY } = getClientPoint(canvas, 500 + 10, 800 - 10);
      simulateMouseEvent(el, 'mousedown', {
        clientX,
        clientY,
      });
      simulateMouseEvent(el, 'mouseup', {
        clientX,
        clientY,
      });
      expect(clickCalled).eqls(true);

      done();
    }, 25);
  });
});
