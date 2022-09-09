import { expect } from 'chai';
import { CSS, CSSUnitValue, mergeTransforms, parseTransform } from '../../';

describe('Property Transform', () => {
  it('parse none transform', () => {
    expect(parseTransform('none')).to.be.eqls([]);
  });

  it('parse scale values', () => {
    let result = parseTransform('scale(-2) scale(3,-4) scaleX(5) scaleY(-1) scaleZ(-3)');
    expect(result[0].t).to.be.eqls('scale');
    expect(result[0].d[0].toString()).to.be.eqls('-2');
    expect(result[0].d[1].toString()).to.be.eqls('-2');

    expect(result[1].t).to.be.eqls('scale');
    expect(result[1].d[0].toString()).to.be.eqls('3');
    expect(result[1].d[1].toString()).to.be.eqls('-4');

    expect(result[2].t).to.be.eqls('scalex');
    expect(result[2].d[0].toString()).to.be.eqls('5');

    expect(result[3].t).to.be.eqls('scaley');
    expect(result[3].d[0].toString()).to.be.eqls('-1');

    expect(result[4].t).to.be.eqls('scalez');
    expect(result[4].d[0].toString()).to.be.eqls('-3');

    result = parseTransform('scale3d(-2, 0, 7)');
    expect(result[0].t).to.be.eqls('scale3d');
    expect(result[0].d[0].toString()).to.be.eqls('-2');
    expect(result[0].d[1].toString()).to.be.eqls('0');
    expect(result[0].d[2].toString()).to.be.eqls('7');
  });

  it('parse rotate values', () => {
    const result = parseTransform(
      'rotate(10deg) rotate(1turn) rotateX(0) rotateY(1.5rad) rotateZ(50grad) rotate3d(0, 0, 1, 0deg)',
    );
    expect(result[0].t).to.be.eqls('rotate');
    expect(result[0].d[0].toString()).to.be.eqls('10deg');
    expect(result[1].t).to.be.eqls('rotate');
    expect(result[1].d[0].toString()).to.be.eqls('1turn');
    expect(result[2].t).to.be.eqls('rotatex');
    expect(result[2].d[0].toString()).to.be.eqls('0deg');
    expect(result[3].t).to.be.eqls('rotatey');
    expect(result[3].d[0].toString()).to.be.eqls('1.5rad');
    expect(result[4].t).to.be.eqls('rotatez');
    expect(result[4].d[0].toString()).to.be.eqls('50grad');
    expect(result[5].t).to.be.eqls('rotate3d');
    expect(result[5].d[0].toString()).to.be.eqls('0');
    expect(result[5].d[1].toString()).to.be.eqls('0');
    expect(result[5].d[2].toString()).to.be.eqls('1');
    expect(result[5].d[3].toString()).to.be.eqls('0deg');
  });

  it('parse translate values', () => {
    let result = parseTransform('translate(20%, 30px) translate(0)');
    expect(result[0].t).to.be.eqls('translate');
    expect(result[0].d[0].toString()).to.be.eqls('20%');
    expect(result[0].d[1].toString()).to.be.eqls('30px');
    expect(result[1].t).to.be.eqls('translate');
    expect(result[1].d[0].toString()).to.be.eqls('0px');

    result = parseTransform('translateX(10px) translateX(20%) translateX(0)');
    expect(result[0].t).to.be.eqls('translatex');
    expect(result[0].d[0].toString()).to.be.eqls('10px');
    expect(result[1].t).to.be.eqls('translatex');
    expect(result[1].d[0].toString()).to.be.eqls('20%');
    expect(result[2].t).to.be.eqls('translatex');
    expect(result[2].d[0].toString()).to.be.eqls('0px');

    result = parseTransform('translateY(10px) translateY(20%) translateY(0)');
    expect(result[0].t).to.be.eqls('translatey');
    expect(result[0].d[0].toString()).to.be.eqls('10px');
    expect(result[1].t).to.be.eqls('translatey');
    expect(result[1].d[0].toString()).to.be.eqls('20%');
    expect(result[2].t).to.be.eqls('translatey');
    expect(result[2].d[0].toString()).to.be.eqls('0px');

    result = parseTransform('translateZ(10px) translateZ(0)');
    expect(result[0].t).to.be.eqls('translatez');
    expect(result[0].d[0].toString()).to.be.eqls('10px');
    expect(result[1].t).to.be.eqls('translatez');
    expect(result[1].d[0].toString()).to.be.eqls('0px');

    result = parseTransform(
      'translate3d(10px, 20px, 30px) translate3d(0, 40%, 0) translate3d(50%, 0, 60px)',
    );
    expect(result[0].t).to.be.eqls('translate3d');
    expect(result[0].d[0].toString()).to.be.eqls('10px');
    expect(result[0].d[1].toString()).to.be.eqls('20px');
    expect(result[0].d[2].toString()).to.be.eqls('30px');

    expect(result[1].t).to.be.eqls('translate3d');
    expect(result[1].d[0].toString()).to.be.eqls('0px');
    expect(result[1].d[1].toString()).to.be.eqls('40%');
    expect(result[1].d[2].toString()).to.be.eqls('0px');

    expect(result[2].t).to.be.eqls('translate3d');
    expect(result[2].d[0].toString()).to.be.eqls('50%');
    expect(result[2].d[1].toString()).to.be.eqls('0px');
    expect(result[2].d[2].toString()).to.be.eqls('60px');

    result = parseTransform('translate(100px,100px) scale(0.5,0.5) translate(-100px,-100px)');
    expect(result[0].t).to.be.eqls('translate');
    expect(result[0].d[0].toString()).to.be.eqls('100px');
    expect(result[0].d[1].toString()).to.be.eqls('100px');
    expect(result[1].t).to.be.eqls('scale');
    expect(result[1].d[0].toString()).to.be.eqls('0.5');
    expect(result[1].d[1].toString()).to.be.eqls('0.5');
    expect(result[2].t).to.be.eqls('translate');
    expect(result[2].d[0].toString()).to.be.eqls('-100px');
    expect(result[2].d[1].toString()).to.be.eqls('-100px');
  });

  it('should parse matrix correctly.', () => {
    let result = parseTransform('matrix(1, 2, -1, 1, 80, 80)');
    expect(result).to.be.eqls([
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

    result = parseTransform('matrix3d(1, 2, -1, 1, 80, 80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)');
    expect(result).to.be.eqls([
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
    expect(result).to.be.eqls([
      {
        d: [CSS.deg(15), CSS.deg(15)],
        t: 'skew',
      },
    ]);

    result = parseTransform('skew(0)');
    expect(result).to.be.eqls([
      {
        d: [CSS.deg(0), CSS.deg(0)],
        t: 'skew',
      },
    ]);

    result = parseTransform('skew(-0.06turn, 18deg)');
    expect(result).to.be.eqls([
      {
        d: [CSS.turn(-0.06), CSS.deg(18)],
        t: 'skew',
      },
    ]);

    result = parseTransform('skew(.312rad)');
    expect(result).to.be.eqls([
      {
        d: [CSS.rad(0.312), CSS.deg(0)],
        t: 'skew',
      },
    ]);

    result = parseTransform('skewX(.312rad)');
    expect(result).to.be.eqls([
      {
        d: [CSS.rad(0.312)],
        t: 'skewx',
      },
    ]);

    result = parseTransform('skewY(.312rad)');
    expect(result).to.be.eqls([
      {
        d: [CSS.rad(0.312)],
        t: 'skewy',
      },
    ]);
  });

  it('should merge transforms(scale) correctly', () => {
    const [left, right, format] = mergeTransforms(
      [{ t: 'scale', d: [new CSSUnitValue(-2), new CSSUnitValue(-2)] }],
      [{ t: 'scale', d: [new CSSUnitValue(3), new CSSUnitValue(-4)] }],
      null,
    );
    expect(left).to.be.eqls([[-2, -2]]);
    expect(right).to.be.eqls([[3, -4]]);
    expect(format([[1, 2]])).to.be.eqls('scale(1,2)');
  });

  it('should merge transforms(scalex & scaley) correctly', () => {
    const [left, right, format] = mergeTransforms(
      [{ t: 'scalex', d: [new CSSUnitValue(2)] }],
      [{ t: 'scaley', d: [new CSSUnitValue(3)] }],
      null,
    );
    expect(left).to.be.eqls([[2, 1]]);
    expect(right).to.be.eqls([[1, 3]]);
    expect(format([[1, 2]])).to.be.eqls('scale(1,2)');
  });

  it('should merge transforms(scale & scaley) correctly', () => {
    const [left, right, format] = mergeTransforms(
      [{ t: 'scale', d: [new CSSUnitValue(1), new CSSUnitValue(2)] }],
      [{ t: 'scaley', d: [new CSSUnitValue(3)] }],
      null,
    );
    expect(left).to.be.eqls([[1, 2]]);
    expect(right).to.be.eqls([[1, 3]]);
    expect(format([[1, 2]])).to.be.eqls('scale(1,2)');
  });

  it('should merge transforms(scale & scaley) correctly', () => {
    const [left, right, format] = mergeTransforms(
      [{ t: 'scale', d: [new CSSUnitValue(0.0001), new CSSUnitValue(1)] }],
      [{ t: 'scaley', d: [new CSSUnitValue(1)] }],
      null,
    );
    expect(left).to.be.eqls([[0.0001, 1]]);
    expect(right).to.be.eqls([[1, 1]]);
    expect(format([[0.0001, 1]])).to.be.eqls('scale(0.0001,1)');
  });

  it('should merge transforms(translatex) correctly', () => {
    const [left, right, format] = mergeTransforms(
      [{ t: 'translatex', d: [new CSSUnitValue(1, 'px')] }],
      [{ t: 'translatex', d: [new CSSUnitValue(10, 'px')] }],
      null,
    );
    expect(left).to.be.eqls([[1]]);
    expect(right).to.be.eqls([[10]]);
    expect(format([[10]])).to.be.eqls('translatex(10px)');
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
    expect(left).to.be.eqls([[1, 1]]);
    expect(right).to.be.eqls([[10, 10]]);
    expect(format([[10, 20]])).to.be.eqls('translate(10px,20px)');
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
    expect(left).to.be.eqls([
      [1, 1],
      [1, 2],
    ]);
    expect(right).to.be.eqls([
      [10, 10],
      [1, 2],
    ]);
    expect(
      format([
        [10, 20],
        [10, 20],
      ]),
    ).to.be.eqls('translate(10px,20px) scale(10,20)');
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
    expect(left).to.be.eqls([[15, 15]]);
    expect(right).to.be.eqls([[30, 30]]);
    expect(format([[20, 20]])).to.be.eqls('skew(20deg,20deg)');

    [left, right, format] = mergeTransforms(
      [
        {
          d: [CSS.deg(15)],
          t: 'skewx',
        },
      ],
      [
        {
          d: [CSS.deg(30)],
          t: 'skewx',
        },
      ],
      null,
    );
    expect(left).to.be.eqls([[15]]);
    expect(right).to.be.eqls([[30]]);
    expect(format([[20]])).to.be.eqls('skewx(20deg)');

    [left, right, format] = mergeTransforms(
      [
        {
          d: [CSS.deg(15)],
          t: 'skewy',
        },
      ],
      [
        {
          d: [CSS.deg(30)],
          t: 'skewy',
        },
      ],
      null,
    );
    expect(left).to.be.eqls([[15]]);
    expect(right).to.be.eqls([[30]]);
    expect(format([[20]])).to.be.eqls('skewy(20deg)');

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
          t: 'skewy',
        },
      ],
      null,
    );
    expect(left).to.be.eqls([[15, 15]]);
    expect(right).to.be.eqls([[0, 30]]);
    expect(format([[20, 10]])).to.be.eqls('skew(20deg,10deg)');

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
          t: 'skewx',
        },
      ],
      null,
    );
    expect(left).to.be.eqls([[15, 15]]);
    expect(right).to.be.eqls([[30, 0]]);
    expect(format([[20, 10]])).to.be.eqls('skew(20deg,10deg)');
  });

  it('should merge matrix correctly', () => {
    const [left, right, format] = mergeTransforms(
      [
        {
          t: 'translatey',
          d: [new CSSUnitValue(0, 'px')],
        },
        { t: 'scale', d: [new CSSUnitValue(0.7), new CSSUnitValue(0.7)] },
      ],
      [
        {
          t: 'translatey',
          d: [new CSSUnitValue(0, 'px')],
        },
      ],
      null,
    );

    expect(format(left)).to.be.eqls('matrix(0.700000,0,0,0.700000,0,0)');
    expect(format(right)).to.be.eqls('matrix(1,0,0,1,0,0)');
  });

  it('should merge matrix3d correctly', () => {
    const [left, right, format] = mergeTransforms(
      [
        {
          t: 'translate3d',
          d: [new CSSUnitValue(0, 'px'), new CSSUnitValue(0, 'px'), new CSSUnitValue(10, 'px')],
        },
        { t: 'scale3d', d: [new CSSUnitValue(0.7), new CSSUnitValue(0.7), new CSSUnitValue(2)] },
      ],
      [
        {
          t: 'translatey',
          d: [new CSSUnitValue(0, 'px')],
        },
      ],
      null,
    );

    expect(format(left)).to.be.eqls('matrix3d(0.700000,0,0,0,0,0.700000,0,0,0,0,2,0,0,0,10,1)');
    expect(format(right)).to.be.eqls('matrix(1,0,0,1,0,0)');
  });
});
