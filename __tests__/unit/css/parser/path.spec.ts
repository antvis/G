import { mergePaths, parsePath } from '../../../../packages/g-lite/src/css';

describe('Property Path', () => {
  it('should parse empty path correctly.', () => {
    let parsed = parsePath('');
    expect(parsed.absolutePath).toStrictEqual([]);

    // @ts-ignore
    parsed = parsePath([]);
    expect(parsed.absolutePath).toStrictEqual([]);
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
    } = parsePath('M 0 0 L 100 0');
    expect(absolutePath).toStrictEqual([
      ['M', 0, 0],
      ['L', 100, 0],
    ]);
    expect(hasArc).toBe(false);
    expect(segments).toStrictEqual([
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
    expect(polygons).toStrictEqual([]);
    expect(polylines).toStrictEqual([
      [
        [0, 0],
        [100, 0],
      ],
    ]);
    // delay the calculation of length
    expect(totalLength).toBe(0);
    expect(rect).toStrictEqual({ height: 0, width: 100, x: 0, y: 0 });

    parsePath('M 0 0 L 100 0');
  });

  it('should merge paths correctly.', () => {
    const path1 = parsePath('M 0 0 L 100 0');
    const path2 = parsePath('M 0 0 L 200 0');

    const [left, right] = mergePaths(path1, path2);

    expect(left).toStrictEqual([
      ['M', 0, 0],
      ['C', 50, 0, 100, 0, 100, 0],
    ]);
    expect(right).toStrictEqual([
      ['M', 0, 0],
      ['C', 100, 0, 200, 0, 200, 0],
    ]);

    mergePaths(path1, path2);
  });

  it('should remove redundant M commands correctly.', () => {
    let parsed = parsePath('M 0 0 M 0 0 M 0 0 L 100 100');
    expect(parsed.absolutePath).toStrictEqual([
      ['M', 0, 0],
      ['L', 100, 100],
    ]);

    parsed = parsePath('M 0 0 L 100 100 Z M 0 0 L 0 0');
    expect(parsed.absolutePath).toStrictEqual([
      ['M', 0, 0],
      ['L', 100, 100],
      ['Z'],
      ['M', 0, 0],
      ['L', 0, 0],
    ]);

    parsed = parsePath('M 0 0 M 0 0 M 0 0 L 100 100 M 100 100 L 200 200');
    expect(parsed.absolutePath).toStrictEqual([
      ['M', 0, 0],
      ['L', 100, 100],
      ['L', 200, 200],
    ]);

    parsed = parsePath('M 0 0 C 50 0 100 0 100 100 M 100 100 L 200 200');
    expect(parsed.absolutePath).toStrictEqual([
      ['M', 0, 0],
      ['C', 50, 0, 100, 0, 100, 100],
      ['L', 200, 200],
    ]);

    parsed = parsePath('M 0 0 Q 50 0 100 100 M 100 100 L 200 200');
    expect(parsed.absolutePath).toStrictEqual([
      ['M', 0, 0],
      ['Q', 50, 0, 100, 100],
      ['L', 200, 200],
    ]);

    parsed = parsePath(
      'M 0 0 A 50 0 0 0 0 100 100 M 100 100 M 100 100 M 100 100 L 200 200',
    );
    expect(parsed.absolutePath).toStrictEqual([
      ['M', 0, 0],
      ['A', 50, 0, 0, 0, 0, 100, 100],
      ['L', 200, 200],
    ]);

    parsed = parsePath('M 0 0 Q 50 0 100 100 M 200 100 L 200 200');
    expect(parsed.absolutePath).toStrictEqual([
      ['M', 0, 0],
      ['Q', 50, 0, 100, 100],
      ['M', 200, 100],
      ['L', 200, 200],
    ]);
  });
});
