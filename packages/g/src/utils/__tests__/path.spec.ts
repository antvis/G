import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';
import {
  Rect,
  Ellipse,
  Circle,
  Line,
  Polyline,
  Polygon,
  Path,
  convertToPath,
  equalizeSegments,
} from '@antv/g';

chai.use(chaiAlmost());
chai.use(sinonChai);

describe('Path utils', () => {
  it('should convert Circle to Path string correctly', () => {
    const circle = new Circle({
      style: {
        r: 100,
      },
    });
    expect(convertToPath(circle)).to.be.eqls(
      'M-100,0C-100,-55.22847366333008,-55.22847366333008,-100,0,-100C55.22847366333008,-100,100,-55.22847366333008,100,0C100,55.22847366333008,55.22847366333008,100,0,100C-55.22847366333008,100,-100,55.22847366333008,-100,0Z',
    );
  });

  it('should convert Ellipse to Path string correctly', () => {
    const ellipse = new Ellipse({
      style: {
        rx: 100,
        ry: 100,
      },
    });
    expect(convertToPath(ellipse)).to.be.eqls(
      'M-100,0C-100,-55.22847366333008,-55.22847366333008,-100,0,-100C55.22847366333008,-100,100,-55.22847366333008,100,0C100,55.22847366333008,55.22847366333008,100,0,100C-55.22847366333008,100,-100,55.22847366333008,-100,0Z',
    );
  });

  it('should convert Rect to Path string correctly', () => {
    const rect = new Rect({
      style: {
        width: 100,
        height: 100,
      },
    });
    expect(convertToPath(rect)).to.be.eqls('M0,0L100,0L100,100L0,100Z');

    rect.style.radius = 10;
    expect(convertToPath(rect)).to.be.eqls(
      'M0,10A10,10,0,0,1,10,0L90,0A10,10,0,0,1,100,10L100,90A10,10,0,0,1,90,100L10,100A10,10,0,0,1,0,90Z',
    );
  });

  it('should convert Line to Path string correctly', () => {
    const line = new Line({
      style: {
        x1: 100,
        y1: 0,
        x2: 100,
        y2: 100,
      },
    });
    expect(convertToPath(line)).to.be.eqls('M0,0L0,100');

    // translate line
    line.translate(100, 100);
    expect(convertToPath(line)).to.be.eqls('M0,0L0,100');

    // scale line
    line.scale(0.5);
    expect(convertToPath(line)).to.be.eqls('M0,0L0,100');

    line.scale(2);
    expect(convertToPath(line)).to.be.eqls('M0,0L0,100');
  });

  it('should convert Polyline to Path string correctly', () => {
    const polyline = new Polyline({
      style: {
        points: [
          [0, 0],
          [0, 100],
        ],
      },
    });
    expect(convertToPath(polyline)).to.be.eqls('M0,0L0,100');
  });

  it('should convert Polygon to Path string correctly', () => {
    const polygon = new Polygon({
      style: {
        points: [
          [0, 0],
          [0, 100],
          [100, 100],
        ],
      },
    });
    expect(convertToPath(polygon)).to.be.eqls('M0,0L0,100L100,100');
  });

  it('should convert Path to Path string correctly', () => {
    const path = new Path({
      style: {
        path: 'M0,0L0,100L100,100',
      },
    });
    expect(convertToPath(path)).to.be.eqls('M0,0C0,0,0,100,0,100C0,100,100,100,100,100');
  });

  // it('should equalizeSegments correctly', () => {
  //   equalizeSegments
  // });
});
