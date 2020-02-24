const expect = require('chai').expect;
import { Canvas } from '../../../src/index';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('Arrow defs', () => {
  const canvas = new Canvas({
    container: dom,
    width: 400,
    height: 400,
  });

  it('default arrow rendering should be same with Canvas', () => {
    const line = canvas.addShape('line', {
      attrs: {
        x1: 50,
        y1: 50,
        x2: 100,
        y2: 100,
        stroke: 'red',
        startArrow: true,
      },
    });
    const el = line.get('el');
    // 格式为: url(#marker_1)
    const markerStart = el.getAttribute('marker-start');
    let markerId = markerStart.split('#')[1];
    markerId = markerId.slice(0, markerId.length - 1);
    // marker 节点
    const markerNode = document.getElementById(markerId);
    expect(markerNode.getAttribute('refX')).eqls(`${10 * Math.cos(Math.PI / 6)}`);
    expect(markerNode.getAttribute('refY')).eqls(`${5}`);
    // marker 下对应的箭头 path 节点
    const pathNode = markerNode.childNodes[0];
    expect(pathNode.getAttribute('d')).eqls(`M0,0 L${10 * Math.cos(Math.PI / 6)},5 L0,10`);
  });

  it('should not create marker defs dom when startArrow or endArrow is false', () => {
    const line = canvas.addShape('line', {
      attrs: {
        x1: 20,
        y1: 20,
        x2: 50,
        y2: 50,
        stroke: 'red',
        startArrow: false,
        endArrow: false,
      },
    });
    const el = line.get('el');
    const markerNodes = document.getElementsByTagName('marker');
    expect(el.getAttribute('marker-start')).eqls(null);
    expect(el.getAttribute('marker-end')).eqls(null);
    expect(markerNodes.length).eqls(0);
  });
});
