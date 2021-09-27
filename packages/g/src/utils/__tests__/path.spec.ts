import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';
import { Rect, Circle, Line } from '../..';
import { convertToPath, equalizeSegments } from '../path';

chai.use(chaiAlmost());
chai.use(sinonChai);

describe('Path utils', () => {
  it('should convert line to path string correctly', () => {
    const line = new Line({
      style: {
        x1: 100,
        y1: 0,
        x2: 100,
        y2: 100,
      },
    });
    expect(convertToPath(line)).to.be.eqls('M100,0L100,100');

    // translate line
    line.translate(100, 100);
    expect(convertToPath(line)).to.be.eqls('M200,100L200,200');

    // scale line
    line.scale(0.5); // length from 100 to 50
    expect(convertToPath(line)).to.be.eqls('M200,100L200,150');

    line.scale(2); // length from 50 to 100
    expect(convertToPath(line)).to.be.eqls('M200,100L200,200');

    // set origin offset [0, 50]
    line.style.origin = [0, 50];
    line.scale(2); // length from 100 to 200
    expect(convertToPath(line)).to.be.eqls('M200,50L200,250');

    // line.style.anchor = [0.5, 0.5];
    // expect(convertToPath(line)).to.be.eqls('M100,0L100,100');
  });

  // it('should equalizeSegments correctly', () => {
  //   equalizeSegments
  // });
});
