import { mat4 } from 'gl-matrix';
import {
  Circle,
  Ellipse,
  Line,
  Path,
  Polygon,
  Polyline,
  Rect,
  convertToPath,
} from '../../../packages/g-lite/src';

describe('Path utils', () => {
  it('should convert Circle to Path string correctly', () => {
    const circle = new Circle({
      style: {
        r: 100,
      },
    });
    expect(convertToPath(circle)).toBe(
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
    expect(convertToPath(ellipse)).toBe(
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
    expect(convertToPath(rect)).toBe('M0,0L100,0L100,100L0,100Z');

    rect.style.radius = 10;
    expect(convertToPath(rect)).toBe(
      'M10,0L90,0A10,10,0,0,1,100,10L100,90A10,10,0,0,1,90,100L10,100A10,10,0,0,1,0,90L0,10A10,10,0,0,1,10,0Z',
    );

    rect.style.radius = '0 10 10 10';
    expect(convertToPath(rect)).toBe(
      'M0,0L90,0A10,10,0,0,1,100,10L100,90A10,10,0,0,1,90,100L10,100A10,10,0,0,1,0,90L0,0Z',
    );

    rect.style.radius = '10 0 10 10';
    expect(convertToPath(rect)).toBe(
      'M10,0L100,0L100,90A10,10,0,0,1,90,100L10,100A10,10,0,0,1,0,90L0,10A10,10,0,0,1,10,0Z',
    );

    rect.style.radius = '10 10 0 10';
    expect(convertToPath(rect)).toBe(
      'M10,0L90,0A10,10,0,0,1,100,10L100,100L10,100A10,10,0,0,1,0,90L0,10A10,10,0,0,1,10,0Z',
    );

    rect.style.radius = '10 10 10 0';
    expect(convertToPath(rect)).toBe(
      'M10,0L90,0A10,10,0,0,1,100,10L100,90A10,10,0,0,1,90,100L0,100L0,10A10,10,0,0,1,10,0Z',
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
    expect(convertToPath(line)).toBe('M100,0L100,100');

    // translate line
    line.translate(100, 100);
    expect(convertToPath(line)).toBe('M200,100L200,200');

    // scale line
    line.scale(0.5);
    expect(convertToPath(line)).toBe('M150,100L150,150');

    line.scale(2);
    expect(convertToPath(line)).toBe('M200,100L200,200');

    line.style.transform = 'translate(100, 100)';
    expect(convertToPath(line)).toBe('M200,100L200,200');

    // ignore all local transformation
    expect(convertToPath(line, mat4.identity(mat4.create()))).toBe(
      'M100,0L100,100',
    );
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
    expect(convertToPath(polyline)).toBe('M0,0L0,100');
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
    expect(convertToPath(polygon)).toBe('M0,0L0,100L100,100Z');
  });

  it('should convert Path to Path string correctly', () => {
    const path = new Path({
      style: {
        d: 'M0,0L0,100L100,100',
      },
    });
    expect(convertToPath(path)).toBe('M0,0L0,100L100,100');

    const path2 = new Path({
      style: {
        d: 'M0,0L0,100L100,100Z',
      },
    });
    expect(convertToPath(path2)).toBe('M0,0L0,100L100,100Z');
  });
});
