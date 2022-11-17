import { expect } from 'chai';
import { parsePath, mergePaths } from '../../../../packages/g-lite/src/css';

describe('Property Path', () => {
  it('should parse empty path correctly.', () => {
    let parsed = parsePath('', undefined);
    expect(parsed.absolutePath).to.be.eqls([]);

    // @ts-ignore
    parsed = parsePath([], undefined);
    expect(parsed.absolutePath).to.be.eqls([]);
  });

  it('should parse path correctly.', () => {
    const {
      absolutePath,
      hasArc,
      segments,
      polygons,
      polylines,
      totalLength,
      rect,
    } = parsePath('M 0 0 L 100 0', undefined);
    expect(absolutePath).to.be.eqls([
      ['M', 0, 0],
      ['L', 100, 0],
    ]);
    expect(hasArc).to.be.eqls(false);
    expect(segments).to.be.eqls([
      {
        arcParams: null,
        box: null,
        command: 'M',
        cubicParams: null,
        currentPoint: [0, 0],
        endTangent: null,
        nextPoint: [100, 0],
        params: ['M', 0, 0],
        prePoint: null,
        startTangent: null,
      },
      {
        arcParams: null,
        box: null,
        command: 'L',
        cubicParams: null,
        currentPoint: [100, 0],
        endTangent: [100, 0],
        nextPoint: null,
        params: ['L', 100, 0],
        prePoint: [0, 0],
        startTangent: [-100, 0],
      },
    ]);
    expect(polygons).to.be.eqls([]);
    expect(polylines).to.be.eqls([
      [
        [0, 0],
        [100, 0],
      ],
    ]);
    // delay the calculation of length
    expect(totalLength).to.be.eqls(0);
    expect(rect).to.be.eqls({ height: 0, width: 100, x: 0, y: 0 });

    parsePath('M 0 0 L 100 0', undefined);
  });

  it('should merge paths correctly.', () => {
    const path1 = parsePath('M 0 0 L 100 0', undefined);
    const path2 = parsePath('M 0 0 L 200 0', undefined);

    const [left, right] = mergePaths(path1, path2, undefined);

    expect(left).to.be.eqls([
      ['M', 0, 0],
      ['C', 50, 0, 68.75, 0, 100, 0],
    ]);
    expect(right).to.be.eqls([
      ['M', 0, 0],
      ['C', 100, 0, 137.5, 0, 200, 0],
    ]);

    mergePaths(path1, path2, undefined);
  });
});
