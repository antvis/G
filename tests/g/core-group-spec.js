var expect = require('@ali/expect.js');
var G = require('../../src/g/index');
var Matrix = require('@ali/g-matrix');
var Matrix3 = Matrix.Matrix3;
var Event = require('@ali/g-event');
var Canvas = require('../../src/canvas');
var div = document.createElement('div');
div.id = 'canvas-group-1';
document.body.appendChild(div);

describe('Group', function() {

  var canvas = new Canvas({
    containerId: 'canvas-group-1',
    width: 200,
    height: 200,
    pixelRatio: 1
  });

  it('constructor', function() {
    var g = new G.Group({
      id: 'g1'
    });

    expect(g.isGroup).to.be(true);
    expect(g.get('children')).not.to.be(undefined);
    expect(g.get('children').length).to.be(0);
  });

  it('add', function() {
    var e = new G.Circle({
      id: 'e1'
    });
    var e2 = new G.Circle({
      id: 'e2'
    });

    var g2 = new G.Group({
      id: 'g2'
    });

    g2.add(e);

    expect(e.get('parent')).to.be(g2);
    expect(g2.getCount()).to.be(1);
    var g3 = new G.Group({
      id: 'g3'
    });

    g3.add(e);

    expect(e.get('parent')).to.be(g3);
    expect(g3.getCount()).to.be(1);
    expect(g2.getCount()).to.be(0);

    var g4 = new G.Group({
      id: 'g4'
    });

    g4.add(g3);
    expect(g3.get('parent')).to.be(g4);
    expect(e.get('parent')).to.be(g3);
    expect(g4.getCount()).to.be(1);
    expect(g3.getCount()).to.be(1);

    g2.add(g3);
    expect(g2.getCount()).to.be(1);
    expect(g3.getCount()).to.be(1);
    expect(g3.get('parent')).to.be(g2);
    expect(e.get('parent')).to.be(g3);

    g3.add(e2);
    expect(g2.getCount()).to.be(1);
    expect(g3.getCount()).to.be(2);
    expect(e2.get('parent')).to.be(g3);
    expect(e.get('parent')).to.be(g3);

    g2.add(e2);
    expect(g2.getCount()).to.be(2);
    expect(g3.getCount()).to.be(1);
    expect(e2.get('parent')).to.be(g2);
    expect(e.get('parent')).to.be(g3);
  });

  it('clear', function() {
    var g = new G.Group({
      id: 'g'
    });

    var e1 = new G.Circle({
      id: 'e1'
    });
    var e2 = new G.Circle({
      id: 'e2'
    });
    var e3 = new G.Circle({
      id: 'e3'
    });

    g.add(e1);
    g.add(e2);
    g.add(e3);

    expect(g.getCount()).to.be(3);
    g.clear();
    expect(g.getCount()).to.be(0);
    expect(e1.get('destroyed')).to.be(true);
  });

  it('destroy', function() {
    var g = new G.Group({
      id: 'g'
    });

    var e1 = new G.Circle({
      id: 'e1'
    });
    var e2 = new G.Circle({
      id: 'e2'
    });
    var e3 = new G.Circle({
      id: 'e3'
    });

    g.add(e1);
    g.add(e2);
    g.add(e3);
    expect(g.getCount()).to.be(3);
    g.destroy();

    expect(g.get('children')).to.be(undefined);
    expect(g.get('destroyed')).to.be(true);
  });

  it('remove', function() {
    var g1 = new G.Group({
      id: 'g1'
    });

    var g2 = new G.Group({
      id: 'g2'
    });

    var e1 = new G.Circle({
      id: 'e1'
    });
    var e2 = new G.Circle({
      id: 'e2'
    });
    var e3 = new G.Circle({
      id: 'e3'
    });
    var e4 = new G.Circle({
      id: 'e4'
    });
    var e5 = new G.Circle({
      id: 'e5'
    });

    g1.add(e1);
    g1.add(e2);
    g1.add(e3);
    g1.add(e4);
    g1.add(e5);

    g2.add(g1);

    expect(g2.getCount()).to.be(1);
    expect(g1.getCount()).to.be(5);
    g1.removeChild(e1, true);
    expect(g1.getCount()).to.be(4);
    expect(e1.get('destroyed')).to.be(true);
    g1.removeChild(e2);
    expect(g1.getCount()).to.be(3);
    expect(e2.get('destroyed')).to.be(true);
    g1.removeChild(e3, false);
    expect(g1.getCount()).to.be(2);
    expect(e3.get('destroyed')).to.be(false);
    g1.removeChild(false);
    expect(g1.getCount()).to.be(2);
    expect(g2.getCount()).to.be(0);
    expect(g1.get('destroyed')).to.be(false);
    g2.add(g1);
    expect(g2.getCount()).to.be(1);
    g1.removeChild();
    expect(g2.getCount()).to.be(0);
    expect(g1.get('destroyed')).to.be(true);
  });

  it('zIndex', function() {
    var g = new G.Group({
      id: 'g'
    });

    var e1 = new G.Circle({
      id: 'e1',
      zIndex: 1
    });

    var e2 = new G.Circle({
      id: 'e2',
      zIndex: 2
    });

    var e3 = new G.Circle({
      id: 'e3',
      zIndex: 3
    });

    g.add(e1);
    g.add(e3);

    expect(g.get('children')[1]).to.be(e3);
    g.add(e2);
    g.sort();
    expect(g.get('children')[1]).to.be(e2);

    e2.set('zIndex', 5);
    expect(g.get('children')[1]).to.be(e3);
    expect(g.get('children')[2]).to.be(e2);
  });

  it('find and findBy', function() {
    var g1 = new G.Group({
      id: 'g1'
    });

    var g2 = new G.Group({
      id: 'g2'
    });

    var e1 = new G.Circle({
      id: 'e1',
      zIndex: 1
    });

    var e2 = new G.Circle({
      id: 'e2',
      zIndex: 2
    });

    var e3 = new G.Circle({
      id: 'e3',
      zIndex: 3
    });


    g1.add(g2);
    g1.add(e1);
    g2.add(e2);
    g2.add(e3);

    expect(g1.findBy(function(item) {
      return item.get('zIndex') === 3;
    })).to.be(e3);

    expect(g1.find('e1')).to.be(e1);
  });
/*
  it('fill', function() {
    var g = new G.Group({
      attrs: {
        fill: 'green'
      }
    });

    var circle = new G.Circle({
      attrs: {
        x: 100,
        y: 100,
        r: 50
      }
    });
    expect(circle.hasFill()).to.be(undefined);
    g.add(circle);
    expect(circle.hasFill()).to.be('green');
    expect(circle.attr('fill')).to.be(undefined);
    var arc = new G.Arc({
      attrs: {
        x: 100,
        y: 100,
        r: 70,
        startAngle: 0,
        endAngle: 120,
        stroke: 'red'
      }
    });
    expect(arc.hasFill()).to.be(undefined);
    g.add(arc);
    expect(arc.hasFill()).to.be(undefined);
    expect(arc.hasStroke()).to.be('red');
    canvas.add(g);
    canvas.draw();
  });

  it('stroke', function() {
    var g = new G.Group({
      attrs: {
        stroke: 'l (0) 0:#00ffff 1:#ffff00'
      }
    });

    var arc = new G.Arc({
      attrs: {
        x: 100,
        y: 100,
        r: 70,
        startAngle: 180,
        endAngle: 300
      }
    });
    expect(arc.hasStroke()).to.be(undefined);
    g.add(arc);
    expect(arc.hasStroke()).to.be('l (0) 0:#00ffff 1:#ffff00');
    canvas.add(g);
    canvas.draw();
  });
*/
  it('transform', function() {
    var arc = new G.Circle({
      attrs: {
        x: 100,
        y: 100,
        r: 50,
        fill: 'red'
      }
    });
    canvas.add(arc);
    expect(canvas.getShape(0, 120)).to.be(undefined);
    expect(canvas.getShape(100, 100)).not.to.be(undefined);
    canvas.draw();

    canvas.rotate(1 / 4 * Math.PI);
    canvas.draw();
    expect(canvas.getShape(0, 120)).not.to.be(undefined);
    expect(canvas.getShape(100, 100)).to.be(undefined);
  /**/
  });

  it('group event', function() {
    var circle = new G.Circle();
    var group = new G.Group();
    group.add(circle);
    var e = new Event('group', {}, true, true);
    e.currentTarget = circle;
    circle.trigger(e);
    var aa = 0;
    var handler = function(e) {
      expect(e.currentTarget).to.be(circle);
      expect(e.target).to.be(group);
      e.stopPropagation();
      aa++;
    };
    group.on('group', handler);
    group.on('group', handler);
    circle.trigger(e);
    expect(aa).to.be(1);;
  });

  it('add items & sort', function() {
    var circle1 = new G.Circle({zIndex: 2});
    var circle2 = new G.Circle({zIndex: 1});
    var circle3 = new G.Circle({zIndex: 3});
    var text = new G.Text({zIndex: 4});

    var group = new G.Group();

    group.add([circle1, circle2, circle3, text]);

    var children = group.get('children');
    expect(children.length).to.be(4);
    expect(children[1]).to.be(circle2);
    group.sort();
    expect(children[1]).to.be(circle1);
    expect(children[0]).to.be(circle2);
    circle1.set('visible', true);
    var box = group.getBBox();
  });

  it('contain', function() {
    var group1 = new G.Group();
    var group2 = new G.Group();
    var r1 = new G.Rect();
    group1.add(r1);
    expect(group1.contain(r1)).to.be(true);
    group2.removeChild(r1);
    expect(r1.get('destroyed')).to.be(false);
    group1.removeChild(r1);
    expect(group1.contain(r1)).to.be(false);
  });
});
