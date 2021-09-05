import chai, { expect } from 'chai';
import { Text } from '../..';
import { vec3 } from 'gl-matrix';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';

chai.use(chaiAlmost());
chai.use(sinonChai);

describe('Text', () => {
  it('should calc global bounds correctly', () => {
    const text = new Text({
      style: {
        fontFamily: 'PingFang SC',
        text: '这是测试文本This is text',
        fontSize: 60,
        fill: '#1890FF',
        stroke: '#F04864',
        lineWidth: 5,
      },
    });

    // get local position
    expect(text.getLocalPosition()).eqls(vec3.fromValues(0, 0, 0));

    // // get bounds
    // let bounds = text.getBounds();
    // if (bounds) {
    //   expect(bounds.center[0]).to.almost.eqls(336.61);
    //   expect(bounds.center[1]).to.almost.eqls(-19.5);
    //   expect(bounds.halfExtents[0]).to.almost.eqls(341.6);
    //   expect(bounds.halfExtents[1]).to.almost.eqls(41.5);
    // }

    // // change lineWidth
    // line.style.lineWidth = 20;
    // bounds = line.getBounds();
    // if (bounds) {
    //   expect(bounds.center).eqls(vec3.fromValues(300, 100, 0));
    //   expect(bounds.halfExtents).eqls(vec3.fromValues(120, 20, 0));
    // }
  });
});
