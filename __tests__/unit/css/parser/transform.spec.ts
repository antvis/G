import {
  CSS,
  CSSUnitValue,
  mergeTransforms,
  parseTransform,
} from '../../../../packages/g-lite/src/css';

describe('Property Transform', () => {
  it('parse none transform', () => {
    expect(parseTransform('none')).toStrictEqual([]);
  });

  it('parse scale values', () => {
    let result = parseTransform(
      'scale(-2) scale(3,-4) scaleX(5) scaleY(-1) scaleZ(-3)',
    );
    expect(result[0].t).toBe('scale');
    expect(result[0].d[0].toString()).toBe('-2');
    expect(result[0].d[1].toString()).toBe('-2');

    expect(result[1].t).toBe('scale');
    expect(result[1].d[0].toString()).toBe('3');
    expect(result[1].d[1].toString()).toBe('-4');

    expect(result[2].t).toBe('scaleX');
    expect(result[2].d[0].toString()).toBe('5');

    expect(result[3].t).toBe('scaleY');
    expect(result[3].d[0].toString()).toBe('-1');

    expect(result[4].t).toBe('scaleZ');
    expect(result[4].d[0].toString()).toBe('-3');

    result = parseTransform('scale3d(-2, 0, 7)');
    expect(result[0].t).toBe('scale3d');
    expect(result[0].d[0].toString()).toBe('-2');
    expect(result[0].d[1].toString()).toBe('0');
    expect(result[0].d[2].toString()).toBe('7');
  });

  it('parse rotate values', () => {
    const result = parseTransform(
      'rotate(10deg) rotate(1turn) rotateX(0) rotateY(1.5rad) rotateZ(50grad) rotate3d(0, 0, 1, 0deg)',
    );
    expect(result[0].t).toBe('rotate');
    expect(result[0].d[0].toString()).toBe('10deg');
    expect(result[1].t).toBe('rotate');
    expect(result[1].d[0].toString()).toBe('1turn');
    expect(result[2].t).toBe('rotateX');
    expect(result[2].d[0].toString()).toBe('0deg');
    expect(result[3].t).toBe('rotateY');
    expect(result[3].d[0].toString()).toBe('1.5rad');
    expect(result[4].t).toBe('rotateZ');
    expect(result[4].d[0].toString()).toBe('50grad');
    expect(result[5].t).toBe('rotate3d');
    expect(result[5].d[0].toString()).toBe('0');
    expect(result[5].d[1].toString()).toBe('0');
    expect(result[5].d[2].toString()).toBe('1');
    expect(result[5].d[3].toString()).toBe('0deg');
  });

  it('parse translate values', () => {
    let result = parseTransform('translate(20%, 30px) translate(0)');
    expect(result[0].t).toBe('translate');
    expect(result[0].d[0].toString()).toBe('20%');
    expect(result[0].d[1].toString()).toBe('30px');
    expect(result[1].t).toBe('translate');
    expect(result[1].d[0].toString()).toBe('0px');

    result = parseTransform('translateX(10px) translateX(20%) translateX(0)');
    expect(result[0].t).toBe('translateX');
    expect(result[0].d[0].toString()).toBe('10px');
    expect(result[1].t).toBe('translateX');
    expect(result[1].d[0].toString()).toBe('20%');
    expect(result[2].t).toBe('translateX');
    expect(result[2].d[0].toString()).toBe('0px');

    result = parseTransform('translateY(10px) translateY(20%) translateY(0)');
    expect(result[0].t).toBe('translateY');
    expect(result[0].d[0].toString()).toBe('10px');
    expect(result[1].t).toBe('translateY');
    expect(result[1].d[0].toString()).toBe('20%');
    expect(result[2].t).toBe('translateY');
    expect(result[2].d[0].toString()).toBe('0px');

    result = parseTransform('translateZ(10px) translateZ(0)');
    expect(result[0].t).toBe('translateZ');
    expect(result[0].d[0].toString()).toBe('10px');
    expect(result[1].t).toBe('translateZ');
    expect(result[1].d[0].toString()).toBe('0px');

    result = parseTransform(
      'translate3d(10px, 20px, 30px) translate3d(0, 40%, 0) translate3d(50%, 0, 60px)',
    );
    expect(result[0].t).toBe('translate3d');
    expect(result[0].d[0].toString()).toBe('10px');
    expect(result[0].d[1].toString()).toBe('20px');
    expect(result[0].d[2].toString()).toBe('30px');

    expect(result[1].t).toBe('translate3d');
    expect(result[1].d[0].toString()).toBe('0px');
    expect(result[1].d[1].toString()).toBe('40%');
    expect(result[1].d[2].toString()).toBe('0px');

    expect(result[2].t).toBe('translate3d');
    expect(result[2].d[0].toString()).toBe('50%');
    expect(result[2].d[1].toString()).toBe('0px');
    expect(result[2].d[2].toString()).toBe('60px');

    result = parseTransform(
      'translate(100px,100px) scale(0.5,0.5) translate(-100px,-100px)',
    );
    expect(result[0].t).toBe('translate');
    expect(result[0].d[0].toString()).toBe('100px');
    expect(result[0].d[1].toString()).toBe('100px');
    expect(result[1].t).toBe('scale');
    expect(result[1].d[0].toString()).toBe('0.5');
    expect(result[1].d[1].toString()).toBe('0.5');
    expect(result[2].t).toBe('translate');
    expect(result[2].d[0].toString()).toBe('-100px');
    expect(result[2].d[1].toString()).toBe('-100px');
  });

  it('should parse matrix correctly.', () => {
    let result = parseTransform('matrix(1, 2, -1, 1, 80, 80)');
    expect(result).toStrictEqual([
      {
        d: [
          new CSSUnitValue(1),
          new CSSUnitValue(2),
          new CSSUnitValue(-1),
          new CSSUnitValue(1),
          new CSSUnitValue(80),
          new CSSUnitValue(80),
        ],
        t: 'matrix',
      },
    ]);

    result = parseTransform(
      'matrix3d(1, 2, -1, 1, 80, 80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)',
    );
    expect(result).toStrictEqual([
      {
        d: [
          new CSSUnitValue(1),
          new CSSUnitValue(2),
          new CSSUnitValue(-1),
          new CSSUnitValue(1),
          new CSSUnitValue(80),
          new CSSUnitValue(80),
          CSS.number(0),
          CSS.number(0),
          CSS.number(0),
          CSS.number(0),
          CSS.number(0),
          CSS.number(0),
          CSS.number(0),
          CSS.number(0),
          CSS.number(0),
          CSS.number(0),
        ],
        t: 'matrix3d',
      },
    ]);

    result = parseTransform('skew(15deg, 15deg)');
    expect(result).toStrictEqual([
      {
        d: [CSS.deg(15), CSS.deg(15)],
        t: 'skew',
      },
    ]);

    result = parseTransform('skew(0)');
    expect(result).toStrictEqual([
      {
        d: [CSS.deg(0), CSS.deg(0)],
        t: 'skew',
      },
    ]);

    result = parseTransform('skew(-0.06turn, 18deg)');
    expect(result).toStrictEqual([
      {
        d: [CSS.turn(-0.06), CSS.deg(18)],
        t: 'skew',
      },
    ]);

    result = parseTransform('skew(.312rad)');
    expect(result).toStrictEqual([
      {
        d: [CSS.rad(0.312), CSS.deg(0)],
        t: 'skew',
      },
    ]);

    result = parseTransform('skewX(.312rad)');
    expect(result).toStrictEqual([
      {
        d: [CSS.rad(0.312)],
        t: 'skewX',
      },
    ]);

    result = parseTransform('skewY(.312rad)');
    expect(result).toStrictEqual([
      {
        d: [CSS.rad(0.312)],
        t: 'skewY',
      },
    ]);
  });

  it('should merge transforms(scale) correctly', () => {
    const [left, right, format] = mergeTransforms(
      [{ t: 'scale', d: [new CSSUnitValue(-2), new CSSUnitValue(-2)] }],
      [{ t: 'scale', d: [new CSSUnitValue(3), new CSSUnitValue(-4)] }],
      null,
    );
    expect(left).toStrictEqual([[-2, -2]]);
    expect(right).toStrictEqual([[3, -4]]);
    expect(format([[1, 2]])).toBe('scale(1,2)');
  });

  it('should merge transforms(scaleX & scaleY) correctly', () => {
    const [left, right, format] = mergeTransforms(
      [{ t: 'scaleX', d: [new CSSUnitValue(2)] }],
      [{ t: 'scaleY', d: [new CSSUnitValue(3)] }],
      null,
    );
    expect(left).toStrictEqual([[2, 1]]);
    expect(right).toStrictEqual([[1, 3]]);
    expect(format([[1, 2]])).toBe('scale(1,2)');
  });

  it('should merge transforms(scale & scaleY) correctly', () => {
    const [left, right, format] = mergeTransforms(
      [{ t: 'scale', d: [new CSSUnitValue(1), new CSSUnitValue(2)] }],
      [{ t: 'scaleY', d: [new CSSUnitValue(3)] }],
      null,
    );
    expect(left).toStrictEqual([[1, 2]]);
    expect(right).toStrictEqual([[1, 3]]);
    expect(format([[1, 2]])).toBe('scale(1,2)');
  });

  it('should merge transforms(scale & scaleY) correctly', () => {
    const [left, right, format] = mergeTransforms(
      [{ t: 'scale', d: [new CSSUnitValue(0.0001), new CSSUnitValue(1)] }],
      [{ t: 'scaleY', d: [new CSSUnitValue(1)] }],
      null,
    );
    expect(left).toStrictEqual([[0.0001, 1]]);
    expect(right).toStrictEqual([[1, 1]]);
    expect(format([[0.0001, 1]])).toBe('scale(0.0001,1)');
  });

  it('should merge transforms(translateX) correctly', () => {
    const [left, right, format] = mergeTransforms(
      [{ t: 'translateX', d: [new CSSUnitValue(1, 'px')] }],
      [{ t: 'translateX', d: [new CSSUnitValue(10, 'px')] }],
      null,
    );
    expect(left).toStrictEqual([[1]]);
    expect(right).toStrictEqual([[10]]);
    expect(format([[10]])).toBe('translateX(10px)');
  });

  it('should merge transforms(translate) correctly', () => {
    const [left, right, format] = mergeTransforms(
      [
        {
          t: 'translate',
          d: [new CSSUnitValue(1, 'px'), new CSSUnitValue(1, 'px')],
        },
      ],
      [
        {
          t: 'translate',
          d: [new CSSUnitValue(10, 'px'), new CSSUnitValue(10, 'px')],
        },
      ],
      null,
    );
    expect(left).toStrictEqual([[1, 1]]);
    expect(right).toStrictEqual([[10, 10]]);
    expect(format([[10, 20]])).toBe('translate(10px,20px)');
  });

  it('should merge transforms(translate & scale) correctly', () => {
    const [left, right, format] = mergeTransforms(
      [
        {
          t: 'translate',
          d: [new CSSUnitValue(1, 'px'), new CSSUnitValue(1, 'px')],
        },
        { t: 'scale', d: [new CSSUnitValue(1), new CSSUnitValue(2)] },
      ],
      [
        {
          t: 'translate',
          d: [new CSSUnitValue(10, 'px'), new CSSUnitValue(10, 'px')],
        },
        { t: 'scale', d: [new CSSUnitValue(1), new CSSUnitValue(2)] },
      ],
      null,
    );
    expect(left).toStrictEqual([
      [1, 1],
      [1, 2],
    ]);
    expect(right).toStrictEqual([
      [10, 10],
      [1, 2],
    ]);
    expect(
      format([
        [10, 20],
        [10, 20],
      ]),
    ).toBe('translate(10px,20px) scale(10,20)');
  });

  it('should merge transforms(skew) correctly', () => {
    let [left, right, format] = mergeTransforms(
      [
        {
          d: [CSS.deg(15), CSS.deg(15)],
          t: 'skew',
        },
      ],
      [
        {
          d: [CSS.deg(30), CSS.deg(30)],
          t: 'skew',
        },
      ],
      null,
    );
    expect(left).toStrictEqual([[15, 15]]);
    expect(right).toStrictEqual([[30, 30]]);
    expect(format([[20, 20]])).toBe('skew(20deg,20deg)');

    [left, right, format] = mergeTransforms(
      [
        {
          d: [CSS.deg(15)],
          t: 'skewX',
        },
      ],
      [
        {
          d: [CSS.deg(30)],
          t: 'skewX',
        },
      ],
      null,
    );
    expect(left).toStrictEqual([[15]]);
    expect(right).toStrictEqual([[30]]);
    expect(format([[20]])).toBe('skewX(20deg)');

    [left, right, format] = mergeTransforms(
      [
        {
          d: [CSS.deg(15)],
          t: 'skewY',
        },
      ],
      [
        {
          d: [CSS.deg(30)],
          t: 'skewY',
        },
      ],
      null,
    );
    expect(left).toStrictEqual([[15]]);
    expect(right).toStrictEqual([[30]]);
    expect(format([[20]])).toBe('skewY(20deg)');

    [left, right, format] = mergeTransforms(
      [
        {
          d: [CSS.deg(15), CSS.deg(15)],
          t: 'skew',
        },
      ],
      [
        {
          d: [CSS.deg(30)],
          t: 'skewY',
        },
      ],
      null,
    );
    expect(left).toStrictEqual([[15, 15]]);
    expect(right).toStrictEqual([[0, 30]]);
    expect(format([[20, 10]])).toBe('skew(20deg,10deg)');

    [left, right, format] = mergeTransforms(
      [
        {
          d: [CSS.deg(15), CSS.deg(15)],
          t: 'skew',
        },
      ],
      [
        {
          d: [CSS.deg(30)],
          t: 'skewX',
        },
      ],
      null,
    );
    expect(left).toStrictEqual([[15, 15]]);
    expect(right).toStrictEqual([[30, 0]]);
    expect(format([[20, 10]])).toBe('skew(20deg,10deg)');
  });

  it('should merge matrix correctly', () => {
    const [left, right, format] = mergeTransforms(
      [
        {
          t: 'translateY',
          d: [new CSSUnitValue(0, 'px')],
        },
        { t: 'scale', d: [new CSSUnitValue(0.7), new CSSUnitValue(0.7)] },
      ],
      [
        {
          t: 'translateY',
          d: [new CSSUnitValue(0, 'px')],
        },
      ],
      null,
    );

    expect(format(left)).toBe('matrix(0.700000,0,0,0.700000,0,0)');
    expect(format(right)).toBe('matrix(1,0,0,1,0,0)');
  });

  it('should merge matrix3d correctly', () => {
    const [left, right, format] = mergeTransforms(
      [
        {
          t: 'translate3d',
          d: [
            new CSSUnitValue(0, 'px'),
            new CSSUnitValue(0, 'px'),
            new CSSUnitValue(10, 'px'),
          ],
        },
        {
          t: 'scale3d',
          d: [
            new CSSUnitValue(0.7),
            new CSSUnitValue(0.7),
            new CSSUnitValue(2),
          ],
        },
      ],
      [
        {
          t: 'translateY',
          d: [new CSSUnitValue(0, 'px')],
        },
      ],
      null,
    );

    expect(format(left)).toBe(
      'matrix3d(0.700000,0,0,0,0,0.700000,0,0,0,0,2,0,0,0,10,1)',
    );
    expect(format(right)).toBe('matrix(1,0,0,1,0,0)');
  });
});
