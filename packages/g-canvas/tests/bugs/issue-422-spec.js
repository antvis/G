const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import { getColor } from '../get-color';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#422', () => {
  const canvas = new Canvas({
    container: dom,
    width: 400,
    height: 400,
    pixelRatio: 1,
    localRefresh: false,
  });

  const context = canvas.get('context');

  it('should render when localRefresh change from false to true', (done) => {
    const group = canvas.addGroup();
    group.addShape('circle', {
      attrs: {
        x: 100,
        y: 100,
        r: 50,
        fill: 'red',
      },
    });

    canvas.set('localRefresh', true);

    setTimeout(() => {
      expect(getColor(context, 100, 100)).eqls('#ff0000');
      done();
    }, 25);
  });
});
