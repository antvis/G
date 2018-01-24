const expect = require('chai').expect;
const G = require('../../../src/index');
const Event = require('../../../src/event');
const Canvas = require('../../../src/canvas');
const div = document.createElement('div');
div.id = 'canvas-group-1';
document.body.appendChild(div);

describe('Group', function() {

  const canvas = new Canvas({
    containerId: 'canvas-group-1',
    width: 200,
    height: 200,
    pixelRatio: 1
  });

  it('constructor', function() {
    const g = new G.Group({
      id: 'g1'
    });

    expect(g.isGroup).to.be.true;
    expect(g.get('children')).not.to.be.undefined;
    expect(g.get('children').length).to.equal(0);
  });

  it('add', function() {
    const e = new G.Circle({
      id: 'e1'
    });
    const e2 = new G.Circle({
      id: 'e2'
    });

    const g2 = new G.Group({
      id: 'g2'
    });

    g2.add(e);

    expect(e.get('parent')).to.eql(g2);
    expect(g2.getCount()).to.equal(1);
    const g3 = new G.Group({
      id: 'g3'
    });

    g3.add(e);

    expect(e.get('parent')).to.eql(g3);
    expect(g3.getCount()).to.equal(1);
    expect(g2.getCount()).to.equal(0);

    const g4 = new G.Group({
      id: 'g4'
    });

    g4.add(g3);
    expect(g3.get('parent')).to.eql(g4);
    expect(e.get('parent')).to.eql(g3);
    expect(g4.getCount()).to.equal(1);
    expect(g3.getCount()).to.equal(1);

    g2.add(g3);
    expect(g2.getCount()).to.equal(1);
    expect(g3.getCount()).to.equal(1);
    expect(g3.get('parent')).to.eql(g2);
    expect(e.get('parent')).to.eql(g3);

    g3.add(e2);
    expect(g2.getCount()).to.equal(1);
    expect(g3.getCount()).to.equal(2);
    expect(e2.get('parent')).to.eql(g3);
    expect(e.get('parent')).to.eql(g3);

    g2.add(e2);
    expect(g2.getCount()).to.equal(2);
    expect(g3.getCount()).to.equal(1);
    expect(e2.get('parent')).to.eql(g2);
    expect(e.get('parent')).to.eql(g3);
  });

  it('clear', function() {
    const g = new G.Group({
      id: 'g'
    });

    const e1 = new G.Circle({
      id: 'e1'
    });
    const e2 = new G.Circle({
      id: 'e2'
    });
    const e3 = new G.Circle({
      id: 'e3'
    });

    g.add(e1);
    g.add(e2);
    g.add(e3);

    expect(g.getCount()).to.equal(3);
    g.clear();
    expect(g.getCount()).to.equal(0);
    expect(e1.get('destroyed')).to.be.true;
  });

  it('destroy', function() {
    const g = new G.Group({
      id: 'g'
    });

    const e1 = new G.Circle({
      id: 'e1'
    });
    const e2 = new G.Circle({
      id: 'e2'
    });
    const e3 = new G.Circle({
      id: 'e3'
    });

    g.add(e1);
    g.add(e2);
    g.add(e3);
    expect(g.getCount()).to.equal(3);
    g.destroy();

    expect(g.get('children')).to.undefined;
    expect(g.get('destroyed')).to.be.true;
  });

  it('remove', function() {
    const g1 = new G.Group({
      id: 'g1'
    });

    const g2 = new G.Group({
      id: 'g2'
    });

    const e1 = new G.Circle({
      id: 'e1'
    });
    const e2 = new G.Circle({
      id: 'e2'
    });
    const e3 = new G.Circle({
      id: 'e3'
    });
    const e4 = new G.Circle({
      id: 'e4'
    });
    const e5 = new G.Circle({
      id: 'e5'
    });

    g1.add(e1);
    g1.add(e2);
    g1.add(e3);
    g1.add(e4);
    g1.add(e5);

    g2.add(g1);

    expect(g2.getCount()).to.equal(1);
    expect(g1.getCount()).to.equal(5);
    g1.removeChild(e1, true);
    expect(g1.getCount()).to.equal(4);
    expect(e1.get('destroyed')).to.be.true;
    g1.removeChild(e2);
    expect(g1.getCount()).to.equal(3);
    expect(e2.get('destroyed')).to.be.true;
    g1.removeChild(e3, false);
    expect(g1.getCount()).to.equal(2);
    expect(e3.get('destroyed')).to.be.false;
    g1.removeChild(false);
    expect(g1.getCount()).to.equal(2);
    expect(g2.getCount()).to.equal(0);
    expect(g1.get('destroyed')).to.be.false;
    g2.add(g1);
    expect(g2.getCount()).to.equal(1);
    g1.removeChild();
    expect(g2.getCount()).to.equal(0);
    expect(g1.get('destroyed')).to.be.true;
  });

  it('zIndex', function() {
    const g = new G.Group({
      id: 'g'
    });

    const e1 = new G.Circle({
      id: 'e1',
      zIndex: 1
    });

    const e2 = new G.Circle({
      id: 'e2',
      zIndex: 2
    });

    const e3 = new G.Circle({
      id: 'e3',
      zIndex: 3
    });

    g.add(e1);
    g.add(e3);

    expect(g.get('children')[1]).to.eql(e3);
    g.add(e2);
    g.sort();
    expect(g.get('children')[1]).to.eql(e2);

    e2.set('zIndex', 5);
    expect(g.get('children')[1]).to.eql(e3);
    expect(g.get('children')[2]).to.eql(e2);
  });

  it('find and findBy', function() {
    const g1 = new G.Group({
      id: 'g1'
    });

    const g2 = new G.Group({
      id: 'g2'
    });

    const e1 = new G.Circle({
      id: 'e1',
      zIndex: 1
    });

    const e2 = new G.Circle({
      id: 'e2',
      zIndex: 2
    });

    const e3 = new G.Circle({
      id: 'e3',
      zIndex: 3
    });


    g1.add(g2);
    g1.add(e1);
    g2.add(e2);
    g2.add(e3);

    expect(g1.findBy(function(item) {
      return item.get('zIndex') === 3;
    })).to.eql(e3);

    expect(g1.find('e1')).to.eql(e1);
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
    expect(circle.hasFill()).to.be.undefined;
    g.add(circle);
    expect(circle.hasFill()).to.be('green');
    expect(circle.attr('fill')).to.be.undefined;
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
    expect(arc.hasFill()).to.be.undefined;
    g.add(arc);
    expect(arc.hasFill()).to.be.undefined;
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
    expect(arc.hasStroke()).to.be.undefined;
    g.add(arc);
    expect(arc.hasStroke()).to.be('l (0) 0:#00ffff 1:#ffff00');
    canvas.add(g);
    canvas.draw();
  });
*/
  it('transform', function() {
    const arc = new G.Circle({
      attrs: {
        x: 100,
        y: 100,
        r: 50,
        fill: 'red'
      }
    });
    canvas.add(arc);
    expect(canvas.getShape(0, 120)).to.be.undefined;
    expect(canvas.getShape(100, 100)).not.to.be.undefined;
    canvas.draw();

    canvas.rotate(1 / 4 * Math.PI);
    canvas.draw();
    expect(canvas.getShape(0, 120)).not.to.be.undefined;
    expect(canvas.getShape(100, 100)).to.be.undefined;

  });

  it('group event', function() {
    const circle = new G.Circle();
    const group = new G.Group();
    group.add(circle);
    const e = new Event('group', {}, true, true);
    e.currentTarget = circle;
    let aa = 0;
    const handler = function(e) {
      expect(e.currentTarget).to.eql(circle);
      e.stopPropagation();
      aa++;
    };
    group.on('group', handler);
    circle.trigger(e);
    expect(aa).to.equal(0);
    group.trigger('group', [ e ]);
    expect(aa).to.equal(1);
  });

  it('add items & sort', function() {
    const circle1 = new G.Circle({ zIndex: 2 });
    const circle2 = new G.Circle({ zIndex: 1 });
    const circle3 = new G.Circle({ zIndex: 3 });
    const text = new G.Text({ zIndex: 4 });

    const group = new G.Group();

    group.add([ circle1, circle2, circle3, text ]);

    const children = group.get('children');
    expect(children.length).to.equal(4);
    expect(children[1]).to.eql(circle2);
    group.sort();
    expect(children[1]).to.eql(circle1);
    expect(children[0]).to.eql(circle2);
    circle1.set('visible', true);
    // const box = group.getBBox();
  });

  it('contain', function() {
    const group1 = new G.Group();
    const group2 = new G.Group();
    const r1 = new G.Rect();
    group1.add(r1);
    expect(group1.contain(r1)).to.be.true;
    group2.removeChild(r1);
    expect(r1.get('destroyed')).to.be.false;
    group1.removeChild(r1);
    expect(group1.contain(r1)).to.be.false;
  });
});
