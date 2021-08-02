import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';

import { Group, Circle, Canvas, Text, Rect, DISPLAY_OBJECT_EVENT } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { parseTransform } from '../transform';

chai.use(chaiAlmost());
chai.use(sinonChai);

const $container = document.createElement('div');
$container.id = 'container';
document.body.prepend($container);

const renderer = new CanvasRenderer();
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer,
});

describe('Transform', () => {
  it('parse scale values', () => {
    expect(parseTransform('scale(-2) scale(3,-4) scaleX(5) scaleY(-1) scaleZ(-3)'))
      .to.be.eqls([
        { t: 'scale', d: [-2, -2] },
        { t: 'scale', d: [3, -4] },
        { t: 'scalex', d: [5] },
        { t: 'scaley', d: [-1] },
        { t: 'scalez', d: [-3] }
      ]);

    expect(parseTransform('scale3d(-2, 0, 7)'))
      .to.be.eqls([{ t: 'scale3d', d: [-2, 0, 7] }]);
  });

  it('parse rotate values', () => {
    expect(parseTransform('rotate(10deg) rotate(1turn) rotateX(0) rotateY(1.5rad) rotateZ(50grad)'))
      .to.be.eqls([
        { t: 'rotate', d: [{ deg: 10 }] },
        { t: 'rotate', d: [{ turn: 1 }] },
        { t: 'rotatex', d: [{ deg: 0 }] },
        { t: 'rotatey', d: [{ rad: 1.5 }] },
        { t: 'rotatez', d: [{ grad: 50 }] }
      ]);
  });

  it('parse translate values', () => {
    expect(parseTransform('translate(20%, 30px) translate(0)')).to.be.eqls([
      { t: 'translate', d: [{ '%': 20 }, { px: 30 }] },
      { t: 'translate', d: [{ px: 0 }, { px: 0 }] }
    ]);
    expect(parseTransform('translateX(10px) translateX(20%) translateX(0)')).to.be.eqls([
      { t: 'translatex', d: [{ px: 10 }] },
      { t: 'translatex', d: [{ '%': 20 }] },
      { t: 'translatex', d: [{ px: 0 }] }
    ]);
    expect(parseTransform('translateY(10px) translateY(20%) translateY(0)')).to.be.eqls([
      { t: 'translatey', d: [{ px: 10 }] },
      { t: 'translatey', d: [{ '%': 20 }] },
      { t: 'translatey', d: [{ px: 0 }] }
    ]);
    expect(parseTransform('translateZ(10px) translateZ(0)')).to.be.eqls([
      { t: 'translatez', d: [{ px: 10 }] },
      { t: 'translatez', d: [{ px: 0 }] }
    ]);
    expect(parseTransform('translate3d(10px, 20px, 30px) translate3d(0, 40%, 0) translate3d(50%, 0, 60px)')).to.be.eqls([
      { t: 'translate3d', d: [{ px: 10 }, { px: 20 }, { px: 30 }] },
      { t: 'translate3d', d: [{ px: 0 }, { '%': 40 }, { px: 0 }] },
      { t: 'translate3d', d: [{ '%': 50 }, { px: 0 }, { px: 60 }] }
    ]);
  });

  // it('parseTransform', () => {
  //   const result = parseTransform('translate(1)');

  //   console.log(result);
  // });
});