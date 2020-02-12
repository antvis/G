const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import { getColor } from '../get-color';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#204', () => {
  const canvas = new Canvas({
    container: dom,
    width: 800,
    height: 800,
    pixelRatio: 1,
  });

  const context = canvas.get('context');

  it('translate', (done) => {
    const rect = canvas.addShape('rect', {
      attrs: {
        x: 50,
        y: 50,
        width: 50,
        height: 50,
        fill: 'red',
      },
    });
    setTimeout(() => {
      expect(getColor(context, 51, 51)).eqls('#ff0000');
      expect(getColor(context, 101, 101)).eqls('#000000');
      rect.translate(50, 50);
      setTimeout(() => {
        expect(getColor(context, 51, 51)).eqls('#000000');
        expect(getColor(context, 101, 101)).eqls('#ff0000');
        done();
      }, 25);
    }, 25);
  });

  it('move', (done) => {
    const rect = canvas.addShape('rect', {
      attrs: {
        x: 150,
        y: 50,
        width: 50,
        height: 50,
        fill: 'red',
      },
    });

    setTimeout(() => {
      expect(getColor(context, 151, 51)).eqls('#ff0000');
      expect(getColor(context, 201, 101)).eqls('#000000');
      rect.move(200, 100);
      setTimeout(() => {
        expect(getColor(context, 151, 51)).eqls('#000000');
        expect(getColor(context, 201, 101)).eqls('#ff0000');
        done();
      }, 25);
    }, 25);
  });

  it('moveTo', (done) => {
    const rect = canvas.addShape('rect', {
      attrs: {
        x: 250,
        y: 50,
        width: 50,
        height: 50,
        fill: 'red',
      },
    });
    setTimeout(() => {
      expect(getColor(context, 251, 51)).eqls('#ff0000');
      expect(getColor(context, 301, 101)).eqls('#000000');
      rect.move(300, 100);
      setTimeout(() => {
        expect(getColor(context, 251, 51)).eqls('#000000');
        expect(getColor(context, 301, 101)).eqls('#ff0000');
        done();
      }, 25);
    }, 25);
  });

  it('scale', (done) => {
    const rect = canvas.addShape('rect', {
      attrs: {
        x: 350,
        y: 50,
        width: 50,
        height: 50,
        fill: 'red',
      },
    });
    setTimeout(() => {
      expect(getColor(context, 351, 51)).eqls('#ff0000');
      expect(getColor(context, 176, 26)).eqls('#000000');
      rect.scale(0.5, 0.5);
      setTimeout(() => {
        expect(getColor(context, 351, 51)).eqls('#000000');
        expect(getColor(context, 176, 26)).eqls('#ff0000');
        done();
      }, 25);
    }, 25);
  });

  it('rotate', (done) => {
    const rect = canvas.addShape('rect', {
      attrs: {
        x: 450,
        y: 50,
        width: 50,
        height: 50,
        fill: 'red',
      },
    });
    setTimeout(() => {
      expect(getColor(context, 451, 51)).eqls('#ff0000');
      expect(getColor(context, 280, 350)).eqls('#000000');
      rect.rotate(Math.PI / 4);
      setTimeout(() => {
        expect(getColor(context, 451, 51)).eqls('#000000');
        expect(getColor(context, 280, 400)).eqls('#ff0000');
        done();
      }, 25);
    }, 25);
  });

  it('rotateAtStart', (done) => {
    const rect = canvas.addShape('rect', {
      attrs: {
        x: 600,
        y: 50,
        width: 50,
        height: 50,
        fill: 'red',
      },
    });
    setTimeout(() => {
      expect(getColor(context, 649, 51)).eqls('#ff0000');
      expect(getColor(context, 590, 75)).eqls('#000000');
      rect.rotateAtStart(Math.PI / 4);
      setTimeout(() => {
        expect(getColor(context, 649, 51)).eqls('#000000');
        expect(getColor(context, 590, 75)).eqls('#ff0000');
        done();
      }, 25);
    }, 25);
  });

  it('rotateAtPoint', (done) => {
    const rect = canvas.addShape('rect', {
      attrs: {
        x: 750,
        y: 50,
        width: 50,
        height: 50,
        fill: 'red',
      },
    });
    setTimeout(() => {
      expect(getColor(context, 751, 51)).eqls('#ff0000');
      expect(getColor(context, 748, 75)).eqls('#000000');
      rect.rotateAtPoint(775, 75, Math.PI / 4);
      setTimeout(() => {
        expect(getColor(context, 751, 51)).eqls('#000000');
        expect(getColor(context, 748, 75)).eqls('#ff0000');
        done();
      }, 25);
    }, 25);
  });
});
