const expect = require('chai').expect;
const { resolve } = require('path');
const G = require('../../../../src/index');
const Canvas = G.Canvas;
const PathSegment = require('../../../../src/shapes/util/path-segment');
const div = document.createElement('div');
div.id = 'canvas-path';
document.body.appendChild(div);

function numberEqual(a, b) {
  return Math.abs(a - b) < 0.01;
}

describe('Path', function() {

  const canvas = new Canvas({
    containerId: 'canvas-path',
    width: 800,
    height: 800,
    pixelRatio: 1
  });

  const img = document.createElement('img');
  img.src = resolve(process.cwd(), './test/fixtures/test1.jpg');
  img.id = 'img';
  document.body.appendChild(img);

  const path = new G.Path();

  it('init attrs', function() {
    expect(path.attr('path')).to.undefined;
    expect(path.attr('lineWidth')).to.equal(1);
    expect(path.getBBox()).to.be.null;
    canvas.add(path);
    canvas.draw();
  });

  it('path', function() {
    path.attr('path', null);
    expect(path.getBBox()).to.be.null;
    path.attr('path', []);
    expect(path.getBBox()).to.be.null;
    path.attr('path', [
      [ 'a' ]
    ]);
    expect(path.getBBox()).to.be.null;
    path.attr('path', [
      [ 'M', 200, 200 ],
      [ 'L', 300, 300 ]
    ]);

    expect(path.get('segments').length).to.equal(2);
    const box = path.getBBox();
    expect(box.minX).to.equal(199.5);
    expect(box.maxX).to.equal(300.5);
    expect(box.minY).to.equal(199.5);
    expect(box.maxY).to.equal(300.5);
    expect(numberEqual(path.getTotalLength(), Math.sqrt(20000, 2))).to.be.true;
  });

  it('lineWidth', function() {
    expect(path.attr('lineWidth')).to.equal(1);
    path.attr('lineWidth', 2);
    expect(path.attr('lineWidth')).to.equal(2);
    const box = path.getBBox();
    expect(box.minX).to.equal(199);
    expect(box.maxX).to.equal(301);
    expect(box.minY).to.equal(199);
    expect(box.maxY).to.equal(301);
  });

  it('stroke', function() {
    path.attr('stroke', 'l (0) 0:#fff000 1:#000fff');
    expect(path.attr('stroke')).to.equal('l (0) 0:#fff000 1:#000fff');
    canvas.add(path);
    canvas.draw();
  });

  it('arrow', function() {
    path.attr({
      // startArrow: true,
      endArrow: true,
      arrowAngle: 90,
      arrowLength: 30
    });
    expect(path.attr('endArrow')).to.true;
    expect(path.attr('arrowAngle')).to.equal(90);
    expect(path.attr('arrowLength')).to.equal(30);

    canvas.add(path);
    canvas.draw();
  });

  it('fill', function() {
    const path = new G.Path({
      attrs: {
        path: [
          [ 'M', 200, 200 ],
          [ 'L', 300, 200 ],
          [ 'L', 300, 300 ],
          [ 'Z' ]
        ],
        fill: 'red'
      }
    });
    expect(path.attr('fill')).to.equal('red');
    expect(numberEqual(path.getTotalLength(), Math.sqrt(20000, 2) + 200)).to.be.true;
    canvas.add(path);
    canvas.draw();
  });

  it('path string', function() {
    const path = new G.Path({
      attrs: {
        path: 'M100,600' +
              'l 50,-25' +
              'a25,25 -30 0,1 50,-25' +
              'l 50,-25' +
              'a25,50 -30 0,1 50,-25' +
              'l 50,-25' +
              'a25,75 -30 0,1 50,-25' +
              'l 50,-25' +
              'a25,100 -30 0,1 50,-25' +
              'l 50,-25' +
              'l 0, 200',
        lineWidth: 10,
        lineJoin: 'round',
        stroke: 'red',
        endArrow: new G.Marker({
          attrs: {
            symbol: 'diamond'
          }
        })
      }
    });
    canvas.add(path);
    canvas.draw();
  });

  it('l and L', function() {
    const path = new G.Path({
      attrs: {
        path: [
          [ 'M', 400, 400 ],
          [ 'L', 400, 500 ],
          [ 'l', 50, 50 ],
          [ 'Z' ]
        ],
        stroke: 'red',
        fill: 'green',
        startArrow: true
      }
    });
    expect(path.isHit(400, 400)).to.be.true;
    expect(path.isHit(400, 500)).to.be.true;
    expect(path.isHit(450, 550)).to.be.true;
    expect(path.isHit(405, 450)).to.be.true;
    expect(numberEqual(path.getTotalLength(), 100 + Math.sqrt(5000, 2) + Math.sqrt(25000))).to.be.true;
    canvas.add(path);
    canvas.draw();
  });

  it('h and H', function() {
    const path = new G.Path({
      attrs: {
        path: [
          [ 'M', 200, 400 ],
          [ 'H', 400 ],
          [ 'h', 100 ]
        ],
        stroke: 'red',
        startArrow: true
      }
    });
    expect(path.isHit(200, 400)).to.be.true;
    expect(path.isHit(300, 400)).to.be.true;
    expect(path.isHit(400, 400)).to.be.true;
    expect(path.isHit(500, 400)).to.be.true;
    expect(numberEqual(path.getTotalLength(), 300)).to.be.true;
    canvas.add([ path ]);
    canvas.draw();
  });

  it('v and V', function() {
    const path = new G.Path({
      attrs: {
        path: [
          [ 'M', 200, 400 ],
          [ 'V', 600 ],
          [ 'v', 100 ]
        ],
        stroke: 'red',
        arrow: true
      }
    });
    expect(path.isHit(200, 400)).to.be.true;
    expect(path.isHit(200, 500)).to.be.true;
    expect(path.isHit(200, 600)).to.be.true;
    expect(path.isHit(200, 700)).to.be.true;
    expect(numberEqual(path.getTotalLength(), 300)).to.be.true;
    canvas.add([ path ]);
    canvas.draw();
  });

  it('q and Q', function() {
    const path = new G.Path({
      attrs: {
        path: [
          [ 'M', 200, 400 ],
          [ 'Q', 300, 300, 400, 400 ]
        ],
        stroke: 'red',
        endArrow: true,
        startArrow: true
      }
    });
    expect(path.isHit(200, 400)).to.be.true;
    expect(path.isHit(300, 350)).to.be.true;
    expect(path.isHit(400, 400)).to.be.true;

    const path1 = new G.Path({
      attrs: {
        path: [
          [ 'M', 200, 400 ],
          [ 'q', 50, 50, 100, 0 ]
        ],
        stroke: 'red',
        arrow: true
      }
    });

    expect(path1.isHit(200, 400)).to.be.true;
    expect(path1.isHit(250, 425)).to.be.true;
    expect(path1.isHit(300, 400)).to.be.true;
    canvas.add([ path, path1 ]);
    canvas.draw();
  });

  it('t and T', function() {
    const path = new G.Path({
      attrs: {
        path: [
          [ 'M', 200, 400 ],
          [ 'Q', 300, 300, 400, 400 ],
          [ 'T', 600, 400 ]
        ],
        stroke: 'red',
        endArrow: true,
        startArrow: true
      }
    });
    expect(path.isHit(200, 400)).to.be.true;
    expect(path.isHit(300, 350)).to.be.true;
    expect(path.isHit(400, 400)).to.be.true;
    expect(path.isHit(500, 450)).to.be.true;
    expect(path.isHit(600, 400)).to.be.true;

    const path1 = new G.Path({
      attrs: {
        path: [
          [ 'M', 200, 400 ],
          [ 'Q', 300, 300, 400, 400 ],
          [ 't', 100, 0 ]
        ],
        stroke: 'red',
        endArrow: true,
        startArrow: true
      }
    });
    expect(path1.isHit(200, 400)).to.be.true;
    expect(path1.isHit(300, 350)).to.be.true;
    expect(path1.isHit(400, 400)).to.be.true;
    expect(path1.isHit(475, 450)).to.be.true;
    expect(path1.isHit(500, 400)).to.be.true;


    const path2 = new G.Path({
      attrs: {
        path: [
          [ 'M', 300, 500 ],
          [ 'L', 500, 500 ],
          [ 't', 200, 0 ]
        ],
        stroke: 'red',
        arrow: true
      }
    });
    expect(path2.isHit(300, 500)).to.be.true;
    expect(path2.isHit(500, 500)).to.be.true;
    expect(path2.isHit(575, 550)).to.be.false;
    expect(path2.isHit(600, 500)).to.be.true;
    canvas.add([ path ]);
    canvas.draw();
  });

  it('c and C', function() {
    const path = new G.Path({
      attrs: {
        path: [
          [ 'M', 200, 400 ],
          [ 'C', 300, 300, 400, 500, 500, 400 ]
        ],
        stroke: 'red',
        startArrow: true,
        endArrow: true
      }
    });

    expect(path.isHit(200, 400)).to.be.true;
    expect(path.isHit(350, 400)).to.be.true;
    expect(path.isHit(500, 400)).to.be.true;

    const path1 = new G.Path({
      attrs: {
        path: [
          [ 'M', 200, 400 ],
          [ 'c', 100, -100, 200, 100, 300, 0 ]
        ],
        stroke: 'red',
        startArrow: true
      }
    });

    expect(path1.isHit(200, 400)).to.be.true;
    expect(path1.isHit(350, 400)).to.be.true;
    expect(path1.isHit(500, 400)).to.be.true;
    canvas.add([ path, path1 ]);
    canvas.draw();

    const path3 = new G.Path({
      attrs: {
        path: [
          [ 'M', 200, 400 ],
          [ 'C', 200, 500, 200, 600, 200, 700 ]
        ],
        stroke: 'red',
        startArrow: true
      }
    });
    expect(path3.getTotalLength()).to.equal(300);
  });

  it('s and S', function() {
    const path = new G.Path({
      attrs: {
        path: [
          [ 'M', 200, 400 ],
          [ 'C', 300, 300, 400, 500, 500, 400 ],
          [ 'S', 700, 500, 800, 400 ]
        ],
        stroke: 'red',
        startArrow: true,
        endArrow: true
      }
    });
    expect(path.isHit(200, 400)).to.be.true;
    expect(path.isHit(350, 400)).to.be.true;
    expect(path.isHit(500, 400)).to.be.true;
    expect(path.isHit(650, 400)).to.be.true;
    expect(path.isHit(800, 400)).to.be.true;

    const path1 = new G.Path({
      attrs: {
        path: [
          [ 'M', 200, 400 ],
          [ 'C', 300, 300, 400, 500, 500, 400 ],
          [ 's', 200, 100, 300, 0 ]
        ],
        stroke: 'blue'
      }
    });
    expect(path1.isHit(200, 400)).to.be.true;
    expect(path1.isHit(350, 400)).to.be.true;
    expect(path1.isHit(500, 400)).to.be.true;
    expect(path1.isHit(650, 400)).to.be.true;
    expect(path1.isHit(800, 400)).to.be.true;

    const path2 = new G.Path({
      attrs: {
        path: [
          [ 'M', 200, 400 ],
          [ 'L', 500, 400 ],
          [ 's', 200, 100, 300, 0 ]
        ],
        stroke: 'red',
        startArrow: true,
        endArrow: true
      }
    });
    expect(path2.isHit(200, 400)).to.be.true;
    expect(path2.isHit(500, 400)).to.be.true;
    expect(path2.isHit(650, 400)).to.be.false;
    expect(path2.isHit(675, 450)).to.be.true;
    expect(path2.isHit(800, 400)).to.be.true;
    canvas.add([ path, path1, path2 ]);
    canvas.draw();
  });

  it('a And A', function() {
    const path = new G.Path({
      attrs: {
        path: [
          [ 'M', 50, 50 ],
          [ 'A', 50, 100, 0, 1, 1, 50, 150 ]
        ],
        stroke: 'red',
        startArrow: true,
        endArrow: true
      }
    });
    expect(numberEqual(path.getTotalLength(), 383.4562355)).to.be.true;
    const path1 = new G.Path({
      attrs: {
        path: [
          [ 'M', 50, 50 ],
          [ 'A', 50, 100, 0, 0, 0, 50, 150 ]
        ],
        stroke: 'red',
        startArrow: true,
        endArrow: true
      }
    });
    expect(numberEqual(path.getTotalLength(), 383.4562355)).to.be.true;
    expect(path.isHit(50, 50)).to.be.true;
    expect(path.isHit(50, 150)).to.be.true;

    const path2 = new G.Path({
      attrs: {
        path: [
          [ 'M', 250, 50 ],
          [ 'A', 50, 100, 0, 1, 0, 250, 150 ]
        ],
        stroke: 'red',
        startArrow: true,
        endArrow: true
      }
    });
    const path3 = new G.Path({
      attrs: {
        path: [
          [ 'M', 250, 50 ],
          [ 'A', 50, 100, 0, 0, 1, 250, 150 ]
        ],
        stroke: 'red',
        startArrow: true,
        endArrow: true
      }
    });
    expect(path.isHit(50, 50)).to.be.true;
    expect(path.isHit(50, 150)).to.be.true;

    canvas.add([ path, path1, path2, path3 ]);
    canvas.draw();
  });

  it('getPoint', function() {
    const path = [
      [ 'M', 300, 300 ],
      [ 'L', 300, 50 ],
      [ 'L', 50, 50 ],
      [ 'L', 50, 300 ]
    ];
    const path7 = new G.Path({
      attrs: {
        path,
        stroke: 'red'
      }
    });
    const point0 = path7.getPoint(0);
    const point1 = path7.getPoint(0.5);
    const point2 = path7.getPoint(1);
    const point3 = path7.getPoint(0.225);
    canvas.add(path7);
    canvas.draw();
    expect(point0).to.eql({ x: 300, y: 300 });
    expect(point1).to.eql({ x: 174.99999999999997, y: 50 });
    expect(point2).to.eql({ x: 50, y: 300 });
    expect(point3).to.eql({ x: 300, y: 112.0546875 });
  });

  it('appendWidth', function() {
    const path = [
      [ 'M', 200, 200 ],
      [ 'L', 200, 50 ],
      [ 'L', 50, 50 ],
      [ 'L', 50, 300 ]
    ];

    const path8 = new G.Path({
      attrs: {
        path,
        lineAppendWidth: 10,
        stroke: 'blue'
      }
    });

    expect(path8.isHit(196, 200)).to.be.true;
    expect(path8.isHit(52, 250)).to.be.true;

    canvas.add(path8);
    canvas.draw();
  });
  it('parse half circle arc', () => {
    const path = [
      [ 'M', 519.7930819138209, 118.03002699452074 ],
      [ 'A', 74.00000092500001, 74.00000092500001, 0, 0, 1, 372.20691808617914, 106.96997300547932 ],
      [ 'L', 353.7586496831543, 105.58746641238116 ],
      [ 'A', 92.49999907500003, 92.49999907500003, 0, 0, 0, 538.2413503168457, 119.41253358761891 ],
      [ 'L', 519.7930819138209, 118.03002699452074 ],
      [ 'z' ]
    ];
    const segments = [];
    let preSegment;
    for (let i = 0; i < path.length; i++) {
      const item = path[i];
      preSegment = new PathSegment(item, preSegment, i === path.length - 1);
      segments.push(preSegment);
    }
    const arc = segments[1];
    const params = arc.params;
    expect(arc.command).to.equal('A');
    expect(params[0].x).to.equal(519.7930819138209);
    expect(params[0].y).to.equal(118.03002699452074);
    expect(params[1]).to.equal(446);
    expect(params[2]).to.equal(112.50000000000003);
    expect(params[3]).to.equal(74.00000092500001);
    expect(params[4]).to.equal(74.00000092500001);
    expect(params[5]).to.equal(0.07479982508547003);
    expect(params[6]).to.equal(3.141592653589793);
    expect(params[7]).to.equal(0);
    expect(params[8]).to.equal(1);
  });
  it('getPoint', () => {
    const path = canvas.addShape('path', {
      attrs: {
        path: [
          [ 'M', 0, 0 ],
          [ 'L', 50, 50 ]
        ]
      }
    });
    expect(path.getPoint(0.5)).eql({
      x: 25,
      y: 25
    });
    path.attr('path', [
      [ 'M', 0, 0 ],
      [ 'L', 100, 100 ]
    ]);
    expect(path.getPoint(0.5)).eql({
      x: 50,
      y: 50
    });
  });
  it('empty path bbox', () => {
    const path = canvas.addShape('path', {
      attrs: {
        path: []
      }
    });
    expect(path.getBBox()).to.equal(null);
  });
  it('0px path bbox', () => {
    const path = canvas.addShape('path', {
      attrs: {
        path: [
          [ 'M', 100, 100 ],
          [ 'A', 100, 100, 0, 0, 1, 100, 100 ]
        ]
      }
    });
    expect(path.getBBox().x).to.equal(0);
    expect(path.getBBox().y).to.equal(0);
    expect(path.getBBox().width).to.equal(0);
    expect(path.getBBox().height).to.equal(0);
  });
});
