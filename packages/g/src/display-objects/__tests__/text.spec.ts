import chai, { expect } from 'chai';
import { Text, Group } from '../..';
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

    // @ts-ignore
    text.setAttribute('font-size', 30);
    expect(text.style.fontSize).to.eqls(30);

    expect(text.nodeValue).eqls('这是测试文本This is text');
    expect(text.textContent).eqls('这是测试文本This is text');

    // get local position
    expect(text.getLocalPosition()).eqls(vec3.fromValues(0, 0, 0));

    text.style.text = 'changed';
    expect(text.nodeValue).eqls('changed');
    expect(text.textContent).eqls('changed');

    const group = new Group();
    expect(group.nodeValue).to.be.null;
    expect(group.textContent).eqls('');
    group.appendChild(text);
    expect(group.nodeValue).to.be.null;
    expect(group.textContent).eqls('changed');

    text.textContent = 'changed again';
    expect(text.nodeValue).eqls('changed again');
    expect(text.textContent).eqls('changed again');

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
