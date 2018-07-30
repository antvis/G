const G = require('../../../../src/index');
const Canvas = G.Canvas;

const div = document.createElement('div');
div.id = 'canvas-clip';
document.body.appendChild(div);

describe('clip', () => {

  const canvas = new Canvas({
    containerId: 'canvas-clip',
    width: 200,
    height: 200,
    pixelRatio: 1,
    renderer: 'svg'
  });

  const shape = new G.Circle({
    attrs: {
      x: 100,
      y: 100,
      r: 50,
      fill: 'black'
    }
  });

  canvas.add(shape);

  it('shape rect', () => {
    const rect = new G.Rect({
      attrs: {
        x: 50,
        y: 50,
        width: 50,
        height: 50
      }
    });
    shape.attr('clip', rect);
    canvas.draw();
  });

  it('shape circle', () => {
    const circle = new G.Circle({
      attrs: {
        x: 50,
        y: 100,
        r: 50
      }
    });

    shape.attr('clip', circle);
    canvas.draw();
  });

  it('shape ellipse', () => {
    const ellipse = new G.Ellipse({
      attrs: {
        x: 100,
        y: 100,
        rx: 50,
        ry: 20
      }
    });

    shape.attr('clip', ellipse);
    canvas.draw();
  });

  it('shape ploygon', () => {
    const polygon = new G.Polygon({
      attrs: {
        points: [
          [ 100, 40 ],
          [ 40, 100 ],
          [ 100, 160 ],
          [ 160, 100 ]
        ]
      }
    });

    shape.attr('clip', polygon);
    canvas.draw();
  });

  it('shape path', () => {
    const path = new G.Path({
      attrs: {
        path: [
          [ 'M', 50, 50 ],
          [ 'L', 100, 50 ],
          [ 'A', 25, 25, 0, 1, 1, 100, 100 ],
          [ 'A', 25, 25, 0, 1, 0, 100, 150 ],
          [ 'L', 50, 150 ],
          [ 'Z' ]
        ]
      }
    });

    shape.attr('clip', path);
    canvas.draw();
  });

  const group = new G.Group();
  group.add(shape);
  canvas.add(group);

  it('group rect', () => {
    const rect = new G.Rect({
      attrs: {
        x: 80,
        y: 75,
        width: 100,
        height: 100
      }
    });
    group.attr('clip', rect);
    canvas.draw();

    // expect(canvas.getShape(100, 70)).to.be.undefined;
    // expect(canvas.getShape(125, 75)).to.eql(shape);
    // expect(canvas.getShape(100, 80)).to.eql(shape);
    // expect(canvas.getShape(150, 150)).to.be(fan);
  });

  it('group circle', () => {
    const circle = new G.Circle({
      attrs: {
        x: 130,
        y: 100,
        r: 60
      }
    });

    group.attr('clip', circle);
    canvas.draw();
  });

  it('group ellipse', () => {
    const ellipse = new G.Ellipse({
      attrs: {
        x: 130,
        y: 100,
        rx: 60,
        ry: 30
      }
    });

    group.attr('clip', ellipse);
    canvas.draw();
  });

  it('group polygon', () => {
    const polygon = new G.Polygon({
      attrs: {
        points: [
          [ 120, 40 ],
          [ 60, 100 ],
          [ 120, 160 ],
          [ 180, 100 ]
        ]
      }
    });

    group.attr('clip', polygon);
    canvas.draw();
  });
});
