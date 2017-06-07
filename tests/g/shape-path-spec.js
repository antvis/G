var expect = require('@ali/expect.js');
var G = require('../../src/g/index');
var Util = require('@ali/g-util');
var gMath = require('@ali/g-math');
var pathUtil = require('@ali/g-path-util');
var Canvas = require('../../src/canvas');
var div = document.createElement('div');
div.id = 'canvas-path';
document.body.appendChild(div);

describe('Path', function() {
 
  var canvas = new Canvas({
    containerId: 'canvas-path',
    width: 800,
    height: 800,
    pixelRatio: 1
  });
  G.debug(true);
  var img = document.createElement('img');
  img.src = '../examples/test1.jpg';
  img.id = 'img';
  document.body.appendChild(img);

  var path = new G.Path();

  it('init attrs', function() {
    expect(path.attr('path')).to.be(undefined);
    expect(path.attr('lineWidth')).to.be(1);
    expect(path.getBBox()).to.be(null);
    canvas.add(path);
    canvas.draw();
  });

  it('path', function() {
    path.attr('path', null);
    expect(path.getBBox()).to.be(null);
    path.attr('path', []);
    expect(path.getBBox()).to.be(null);
    path.attr('path', [
      ['a']
    ]);
    expect(path.getBBox()).to.be(null);
    path.attr('path', [
      ['M', 200, 200],
      ['L', 300, 300]
    ]);

    expect(path.get('segments').length).to.be(2);
    var box = path.getBBox();
    expect(box.minX).to.be(199.5);
    expect(box.maxX).to.be(300.5);
    expect(box.minY).to.be(199.5);
    expect(box.maxY).to.be(300.5);
  });

  it('lineWidth', function() {
    expect(path.attr('lineWidth')).to.be(1);
    path.attr('lineWidth', 2);
    expect(path.attr('lineWidth')).to.be(2);
    var box = path.getBBox();
    expect(box.minX).to.be(199);
    expect(box.maxX).to.be(301);
    expect(box.minY).to.be(199);
    expect(box.maxY).to.be(301);
  });

  it('stroke', function() {
    path.attr('stroke', 'l (0) 0:#fff000 1:#000fff');
    expect(path.attr('stroke')).to.be('l (0) 0:#fff000 1:#000fff');
    canvas.add(path);
    canvas.draw();
  });

  it('fill', function() {
    var path = new G.Path({
      attrs: {
        path: [
          ['M', 200, 200],
          ['L', 300, 200],
          ['L', 300, 300],
          ['Z']
        ],
        fill: 'red'
      }
    });
    expect(path.attr('fill')).to.be('red');
    canvas.add(path);
    canvas.draw();
  });

  it('path string', function() {
    var path = new G.Path({
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
              'l 0, 200,' +
              'z',
        lineWidth: 10,
        lineJoin: 'round',
        stroke: 'red'
      }
    });

    canvas.add(path);
    canvas.draw();
  });

  it('l and L', function() {
    var path = new G.Path({
      attrs: {
        path: [
          ['M', 400, 400],
          ['L', 400, 500],
          ['l', 50, 50],
          ['Z']
        ],
        stroke: 'red',
        fill: 'green',
        arrow: true
      }
    });
    expect(path.isHit(400, 400)).to.be(true);
    expect(path.isHit(400, 500)).to.be(true);
    expect(path.isHit(450, 550)).to.be(true);
    expect(path.isHit(405, 450)).to.be(false);
    canvas.add(path);
    expect(path.isHit(405, 450)).to.be(true);
    canvas.draw();
  });

  it('h and H', function() {
    var path = new G.Path({
      attrs: {
        path: [
          ['M', 200, 400],
          ['H', 400],
          ['h', 100]
        ],
        stroke: 'red',
        arrow: true
      }
    });
    expect(path.isHit(200, 400)).to.be(true);
    expect(path.isHit(300, 400)).to.be(true);
    expect(path.isHit(400, 400)).to.be(true);
    expect(path.isHit(500, 400)).to.be(true);
    canvas.add([path]);
    canvas.draw();
  });

  it('v and V', function() {
    var path = new G.Path({
      attrs: {
        path: [
          ['M', 200, 400],
          ['V', 600],
          ['v', 100]
        ],
        stroke: 'red',
        arrow: true
      }
    });
    expect(path.isHit(200, 400)).to.be(true);
    expect(path.isHit(200, 500)).to.be(true);
    expect(path.isHit(200, 600)).to.be(true);
    expect(path.isHit(200, 700)).to.be(true);
    canvas.add([path]);
    canvas.draw();
  });

  it('q and Q', function() {
    var path = new G.Path({
      attrs: {
        path: [
          ['M', 200, 400],
          ['Q', 300, 300, 400, 400]
        ],
        stroke: 'red',
        arrow: true
      }
    });
    expect(path.isHit(200, 400)).to.be(true);
    expect(path.isHit(300, 350)).to.be(true);
    expect(path.isHit(400, 400)).to.be(true);

    var path1 = new G.Path({
      attrs: {
        path: [
          ['M', 200, 400],
          ['q', 50, 50, 100, 0]
        ],
        stroke: 'red',
        arrow: true
      }
    });

    expect(path1.isHit(200, 400)).to.be(true);
    expect(path1.isHit(250, 425)).to.be(true);
    expect(path1.isHit(300, 400)).to.be(true);
    canvas.add([path, path1]);
    canvas.draw();
  });

  it('t and T', function() {
    var path = new G.Path({
      attrs: {
        path: [
          ['M', 200, 400],
          ['Q', 300, 300, 400, 400],
          ['T', 600, 400]
        ],
        stroke: 'red',
        arrow: true
      }
    });
    expect(path.isHit(200, 400)).to.be(true);
    expect(path.isHit(300, 350)).to.be(true);
    expect(path.isHit(400, 400)).to.be(true);
    expect(path.isHit(500, 450)).to.be(true);
    expect(path.isHit(600, 400)).to.be(true);

    var path1 = new G.Path({
      attrs: {
        path: [
          ['M', 200, 400],
          ['Q', 300, 300, 400, 400],
          ['t', 100, 0]
        ],
        stroke: 'red',
        arrow: true
      }
    });
    expect(path1.isHit(200, 400)).to.be(true);
    expect(path1.isHit(300, 350)).to.be(true);
    expect(path1.isHit(400, 400)).to.be(true);
    expect(path1.isHit(475, 450)).to.be(true);
    expect(path1.isHit(500, 400)).to.be(true);


    var path2 = new G.Path({
      attrs: {
        path: [
          ['M', 200, 400],
          ['L', 400, 400],
          ['t', 100, 0]
        ],
        stroke: 'red',
        arrow: true
      }
    });
    expect(path2.isHit(200, 400)).to.be(true);
    expect(path2.isHit(400, 400)).to.be(true);
    expect(path2.isHit(475, 450)).to.be(false);
    expect(path2.isHit(500, 400)).to.be(true);
    canvas.add([path, path1, path2]);
    canvas.draw()
  });

  it('c and C', function() {
    var path = new G.Path({
      attrs: {
        path: [
          ['M', 200, 400],
          ['C', 300, 300, 400, 500, 500, 400]
        ],
        stroke: 'red',
        arrow: true
      }
    });

    expect(path.isHit(200, 400)).to.be(true);
    expect(path.isHit(350, 400)).to.be(true);
    expect(path.isHit(500, 400)).to.be(true);

    var path1 = new G.Path({
      attrs: {
        path: [
          ['M', 200, 400],
          ['c', 100, -100, 200, 100, 300, 0]
        ],
        stroke: 'red'
      }
    });

    expect(path1.isHit(200, 400)).to.be(true);
    expect(path1.isHit(350, 400)).to.be(true);
    expect(path1.isHit(500, 400)).to.be(true);
    canvas.add([path, path1]);
    canvas.draw()
  });

  it('s and S', function() {
    var path = new G.Path({
      attrs: {
        path: [
          ['M', 200, 400],
          ['C', 300, 300, 400, 500, 500, 400],
          ['S', 700, 500, 800, 400]
        ],
        stroke: 'red'
      }
    });
    expect(path.isHit(200, 400)).to.be(true);
    expect(path.isHit(350, 400)).to.be(true);
    expect(path.isHit(500, 400)).to.be(true);
    expect(path.isHit(650, 400)).to.be(true);
    expect(path.isHit(800, 400)).to.be(true);

    var path1 = new G.Path({
      attrs: {
        path: [
          ['M', 200, 400],
          ['C', 300, 300, 400, 500, 500, 400],
          ['s', 200, 100, 300, 0]
        ],
        stroke: 'blue'
      }
    });
    expect(path1.isHit(200, 400)).to.be(true);
    expect(path1.isHit(350, 400)).to.be(true);
    expect(path1.isHit(500, 400)).to.be(true);
    expect(path1.isHit(650, 400)).to.be(true);
    expect(path1.isHit(800, 400)).to.be(true);

    var path2 = new G.Path({
      attrs: {
        path: [
          ['M', 200, 400],
          ['L', 500, 400],
          ['s', 200, 100, 300, 0]
        ],
        stroke: 'red',
        arrow: true
      }
    });
    expect(path2.isHit(200, 400)).to.be(true);
    expect(path2.isHit(500, 400)).to.be(true);
    expect(path2.isHit(650, 400)).to.be(false);
    expect(path2.isHit(675, 450)).to.be(true);
    expect(path2.isHit(800, 400)).to.be(true);
    canvas.add([path, path1, path2]);
    canvas.draw();
  });

  it('a And A', function() {
    var path = new G.Path({
      attrs: {
        path: [
          ['M', 300, 300],
          ['A', 50, 50, 0, 0, 1, 400, 400]
        ],
        stroke: 'red'
      }
    });

    expect(path.isHit(300, 300)).to.be(true);
    expect(path.isHit(400, 400)).to.be(true);
    expect(path.isHit(400, 300)).to.be(true);

    var path1 = new G.Path({
      attrs: {
        path: [
          ['M', 300, 300],
          ['A', 50, 50, 0, 0, 1, 400, 400]
        ],
        stroke: 'red'
      }
    });
    expect(path1.isHit(300, 300)).to.be(true);
    expect(path1.isHit(400, 400)).to.be(true);
    expect(path1.isHit(400, 300)).to.be(true);

   /* var img = new Image();

    img.onload = function() {

    };

    var path2 = new G.Path({
      attrs: {
        path: [
          ['M', 300, 300],
          ['A', 50, 50, 0, 1, 1, 300, 400],
          ['z']
        ],
        stroke: 'p a img'
      }
    });
    expect(path2.isHit(300, 300)).to.be(true);
    expect(path2.isHit(300, 400)).to.be(true);
    expect(path2.isHit(350, 350)).to.be(true);
    expect(path2.isHit(300, 350)).to.be(true);
    canvas.add(path2);
    canvas.draw();
    path2.set('attrs', {
      path: [
        ['M', 300, 300],
        ['A', 50, 50, 0, 1, 1, 300, 400],
        ['z']
      ],
      stroke: 'p x img'
    });
    path2.hide();
    path2.show();
    canvas.draw();

    var path3 = new G.Path({
      attrs: {
        path: [
          ['M', 300, 300],
          ['A', 50, 50, 0, 1, 1, 300, 400],
          ['z']
        ],
        stroke: 'p y img'
      }
    });
    canvas.add(path3);
    canvas.draw();

    var path4 = new G.Path({
      attrs: {
        path: [
          ['M', 300, 300],
          ['A', 50, 50, 0, 1, 1, 300, 400],
          ['z']
        ],
        stroke: 'p n img'
      }
    });
    canvas.add(path4);
    canvas.draw();


    var path5 = new G.Path({
      attrs: {
        path: [
          ['M', 300, 300],
          ['A', 50, 50, 0, 1, 1, 300, 400],
          ['z']
        ],
        stroke: 'p e img'
      }
    });
    canvas.add(path5);
    canvas.draw();

    var path6 = new G.Path({
      attrs: {
        path: [
          ['M', 300, 300],
          ['A', 50, 50, 0, 1, 1, 300, 400],
          ['z']
        ],
        stroke: 'p a img'
      }
    });
    canvas.add(path6);
    */
    canvas.draw();
  });

  it('getPoint', function(){
    var path = [
      ['M', 300, 300],
      ['L', 300, 50],
      ['L', 50, 50],
      ['L', 50, 300],
    ];
    // var curve = pathUtil.toCurve(path);
    var path7 = new G.Path({
      attrs: {
        path: path,
        stroke: 'red'
      }
    });
    var point0 = path7.getPoint(0);
    var point1 = path7.getPoint(0.5);
    var point2 = path7.getPoint(1);
    var point3 = path7.getPoint(0.225);
    // var point = point3;
    // var circle = new G.Circle({
    //   attrs:{
    //     x: point.x,
    //     y: point.y,
    //     r: 3,
    //     fill: 'blue'
    //   }
    // });
    // var path7Cureve = new G.Path({
    //   attrs: {
    //     path: curve,
    //     stroke: 'blue'
    //   }
    // });
    // path7Cureve.translate(100, 200);
    canvas.add(path7);
    // canvas.add(path7Cureve);
    // canvas.add(circle);
    canvas.draw();
    expect(point0).eql({ x: 300, y: 300 });
    expect(point1).eql({ x: 174.99999999999997, y: 50});
    expect(point2).eql({ x: 50, y: 300 });
    expect(point3).eql({ x: 300, y: 112.0546875 });
  });

  it('appendWidth', function() {
    var path = [
      ['M', 200, 200],
      ['L', 200, 50],
      ['L', 50, 50],
      ['L', 50, 300],
    ];

    var path8 = new G.Path({
      attrs: {
        path: path,
        lineAppendWidth: 10,
        stroke: 'blue'
      }
    });

    expect(path8.isHit(196, 200)).to.be(true);
    expect(path8.isHit(52, 250)).to.be(true);

    canvas.add(path8);
    canvas.draw();
  });

});
