const expect = require('chai').expect;
import { Canvas } from '../../src';
const container = document.createElement('canvas');
container.width = 300;
container.height = 300;
container.id = 'marker';
document.body.appendChild(container);

describe('#688', () => {
  const canvas = new Canvas({
    container,
    width: 600,
    height: 500,
  });

  canvas.addGroup();

  const commonAttrs = {
    r: 30,
    lineWidth: 2,
    stroke: '#F04864',
    fill: '#1890FF',
  };
  const crossMarker = canvas.addShape('marker', {
    attrs: {
      ...commonAttrs,
      x: 100,
      y: 100,
      symbol: 'cross',
    },
  });

  // 被影响了
  const circleMarker = canvas.addShape('marker', {
    attrs: {
      ...commonAttrs,
      x: 300,
      y: 100,
      symbol: 'circle',
    },
  });

  it('init', () => {
    expect(crossMarker.attr('symbol')).eqls('cross');
    expect(crossMarker.attr('path')).eqls(undefined);
    expect(circleMarker.attr('symbol')).eqls('circle');
    expect(circleMarker.attr('path')).not.eqls(null);
  });
});
