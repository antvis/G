const G = require('../../../../src/index');

const Canvas = G.Canvas;
const div = document.createElement('div');
document.body.appendChild(div);

describe.only('paths with arrows', () => {
  const canvas = new Canvas({
    width: 500,
    height: 500,
    containerDOM: div
  });

  it('path with arrow', () => {
    canvas.addShape('path', {
      attrs: {
        path: [
          [ 'M', 10, 40 ],
          [ 'L', 10, 140 ]
        ],
        stroke: '#000'
      }
    });
    canvas.addShape('path', {
      attrs: {
        path: [
          [ 'M', 40, 40 ],
          [ 'L', 40, 140 ]
        ],
        stroke: '#F00',
        startArrow: true,
        endArrow: true
      }
    });
    canvas.addShape('path', {
      attrs: {
        path: [
          [ 'M', 70, 40 ],
          [ 'L', 70, 140 ]
        ],
        stroke: '#00F',
        lineWidth: 5,
        startArrow: {
          path: 'M 10,0 L -10,-10 L -10,10 Z',
          d: 10
        },
        endArrow: {
          path: 'M 10,0 L -10,-10 L -10,10 Z',
          d: 10
        }
      }
    });
    canvas.draw();
  });
  it('Q with arrow', () => {
    canvas.addShape('path', {
      attrs: {
        path: [
          [ 'M', 150, 40 ],
          [ 'L', 150, 100 ],
          [ 'Q', 200, 300, 250, 200 ]
        ],
        stroke: '#000'
      }
    });
    canvas.addShape('path', {
      attrs: {
        path: [
          [ 'M', 200, 40 ],
          [ 'L', 200, 100 ],
          [ 'Q', 250, 300, 300, 200 ]
        ],
        startArrow: {
          path: 'M 10,0 L -10,-10 L -5,0 L -10,10 Z',
          d: 10
        },
        endArrow: {
          path: 'M 10,0 L -10,-10 L -5,0 L -10,10 Z',
          d: 10
        },
        stroke: '#000'
      }
    });
    canvas.draw();
  });
  it('C with arrow', () => {
    canvas.addShape('path', {
      attrs: {
        path: [
          [ 'M', 300, 40 ],
          [ 'C', 300, 100, 400, 100, 400, 160 ]
        ],
        stroke: '#000'
      }
    });
    canvas.addShape('path', {
      attrs: {
        path: [
          [ 'M', 350, 40 ],
          [ 'C', 350, 100, 450, 100, 450, 160 ]
        ],
        stroke: '#00F',
        startArrow: {
          path: 'M 6,0 L -6,-6 L -3,0 L -6,6 Z',
          d: 6
        },
        endArrow: {
          path: 'M 6,0 L -6,-6 L -3,0 L -6,6 Z',
          d: 6
        }
      }
    });
  });
  it('line with arrow', () => {
    canvas.addShape('line', {
      attrs: {
        x1: 10,
        y1: 150,
        x2: 10,
        y2: 250,
        stroke: '#000'
      }
    });
    canvas.addShape('line', {
      attrs: {
        x1: 70,
        y1: 150,
        x2: 70,
        y2: 250,
        stroke: '#F00',
        startArrow: true,
        endArrow: true
      }
    });
    canvas.addShape('line', {
      attrs: {
        x1: 40,
        y1: 150,
        x2: 40,
        y2: 250,
        stroke: '#00F',
        startArrow: {
          path: 'M 6,0 L -6,-6 L -6,6 Z',
          d: 6
        },
        endArrow: {
          path: 'M 6,0 L -6,-6 L -6,6 Z',
          d: 6
        }
      }
    });
    canvas.draw();
  });
  it('polyline with arrow', () => {
    canvas.addShape('polyline', {
      attrs: {
        points: [
          [ 40, 300 ],
          [ 60, 350 ],
          [ 40, 400 ]
        ],
        stroke: '#000'
      }
    });
    canvas.addShape('polyline', {
      attrs: {
        points: [
          [ 80, 300 ],
          [ 100, 350 ],
          [ 80, 400 ]
        ],
        startArrow: true,
        endArrow: true,
        stroke: '#000'
      }
    });
    canvas.addShape('polyline', {
      attrs: {
        points: [
          [ 120, 300 ],
          [ 140, 350 ],
          [ 120, 400 ]
        ],
        startArrow: {
          path: 'M 6,0 L -6,-6 L -6,6 Z',
          d: 6
        },
        endArrow: {
          path: 'M 6,0 L -6,-6 L -6,6 Z',
          d: 6
        },
        stroke: '#000'
      }
    });
    canvas.draw();
  });
});
