import chai, { expect } from 'chai';
import { parseTransform, mergeTransforms } from '../transform';

describe('Transform', () => {
  it('parse none transform', () => {
    expect(parseTransform('none')).to.be.eqls([]);
  });

  it('parse scale values', () => {
    expect(parseTransform('scale(-2) scale(3,-4) scaleX(5) scaleY(-1) scaleZ(-3)')).to.be.eqls([
      { t: 'scale', d: [-2, -2] },
      { t: 'scale', d: [3, -4] },
      { t: 'scalex', d: [5] },
      { t: 'scaley', d: [-1] },
      { t: 'scalez', d: [-3] },
    ]);

    expect(parseTransform('scale3d(-2, 0, 7)')).to.be.eqls([{ t: 'scale3d', d: [-2, 0, 7] }]);
  });

  it('parse rotate values', () => {
    expect(
      parseTransform(
        'rotate(10deg) rotate(1turn) rotateX(0) rotateY(1.5rad) rotateZ(50grad) rotate3d(0, 0, 1, 0deg)',
      ),
    ).to.be.eqls([
      { t: 'rotate', d: [{ unit: 'deg', value: 10 }] },
      { t: 'rotate', d: [{ unit: 'turn', value: 1 }] },
      { t: 'rotatex', d: [{ unit: 'deg', value: 0 }] },
      { t: 'rotatey', d: [{ unit: 'rad', value: 1.5 }] },
      { t: 'rotatez', d: [{ unit: 'grad', value: 50 }] },
      { d: [0, 0, 1, { unit: 'deg', value: 0 }], t: 'rotate3d' },
    ]);
  });

  it('parse translate values', () => {
    expect(parseTransform('translate(20%, 30px) translate(0)')).to.be.eqls([
      {
        t: 'translate',
        d: [
          { unit: '%', value: 20 },
          { unit: 'px', value: 30 },
        ],
      },
      {
        t: 'translate',
        d: [
          { unit: 'px', value: 0 },
          { unit: 'px', value: 0 },
        ],
      },
    ]);
    expect(parseTransform('translateX(10px) translateX(20%) translateX(0)')).to.be.eqls([
      { t: 'translatex', d: [{ unit: 'px', value: 10 }] },
      { t: 'translatex', d: [{ unit: '%', value: 20 }] },
      { t: 'translatex', d: [{ unit: 'px', value: 0 }] },
    ]);
    expect(parseTransform('translateY(10px) translateY(20%) translateY(0)')).to.be.eqls([
      { t: 'translatey', d: [{ unit: 'px', value: 10 }] },
      { t: 'translatey', d: [{ unit: '%', value: 20 }] },
      { t: 'translatey', d: [{ unit: 'px', value: 0 }] },
    ]);
    expect(parseTransform('translateZ(10px) translateZ(0)')).to.be.eqls([
      { t: 'translatez', d: [{ unit: 'px', value: 10 }] },
      { t: 'translatez', d: [{ unit: 'px', value: 0 }] },
    ]);
    expect(
      parseTransform(
        'translate3d(10px, 20px, 30px) translate3d(0, 40%, 0) translate3d(50%, 0, 60px)',
      ),
    ).to.be.eqls([
      {
        t: 'translate3d',
        d: [
          { unit: 'px', value: 10 },
          { unit: 'px', value: 20 },
          { unit: 'px', value: 30 },
        ],
      },
      {
        t: 'translate3d',
        d: [
          { unit: 'px', value: 0 },
          { unit: '%', value: 40 },
          { unit: 'px', value: 0 },
        ],
      },
      {
        t: 'translate3d',
        d: [
          { unit: '%', value: 50 },
          { unit: 'px', value: 0 },
          { unit: 'px', value: 60 },
        ],
      },
    ]);
  });

  it('should merge transforms(scale) correctly', () => {
    const [left, right, format] = mergeTransforms(
      [{ t: 'scale', d: [-2, -2] }],
      [{ t: 'scale', d: [3, -4] }],
      null,
    );
    expect(left).to.be.eqls([[-2, -2]]);
    expect(right).to.be.eqls([[3, -4]]);
    expect(format([[1, 2]])).to.be.eqls('scale(1,2)');
  });

  it('should merge transforms(scalex & scaley) correctly', () => {
    const [left, right, format] = mergeTransforms(
      [{ t: 'scalex', d: [2] }],
      [{ t: 'scaley', d: [3] }],
      null,
    );
    expect(left).to.be.eqls([[2, 1]]);
    expect(right).to.be.eqls([[1, 3]]);
    expect(format([[1, 2]])).to.be.eqls('scale(1,2)');
  });

  it('should merge transforms(scale & scaley) correctly', () => {
    const [left, right, format] = mergeTransforms(
      [{ t: 'scale', d: [1, 2] }],
      [{ t: 'scaley', d: [3] }],
      null,
    );
    expect(left).to.be.eqls([[1, 2]]);
    expect(right).to.be.eqls([[1, 3]]);
    expect(format([[1, 2]])).to.be.eqls('scale(1,2)');
  });

  it('should merge transforms(translatex) correctly', () => {
    const [left, right, format] = mergeTransforms(
      [{ t: 'translatex', d: [{ unit: 'px', value: 1 }] }],
      [{ t: 'translatex', d: [{ unit: 'px', value: 10 }] }],
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
          d: [
            { unit: 'px', value: 1 },
            { unit: 'px', value: 1 },
          ],
        },
      ],
      [
        {
          t: 'translate',
          d: [
            { unit: 'px', value: 10 },
            { unit: 'px', value: 10 },
          ],
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
          d: [
            { unit: 'px', value: 1 },
            { unit: 'px', value: 1 },
          ],
        },
        { t: 'scale', d: [1, 2] },
      ],
      [
        {
          t: 'translate',
          d: [
            { unit: 'px', value: 10 },
            { unit: 'px', value: 10 },
          ],
        },
        { t: 'scale', d: [1, 2] },
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
});
