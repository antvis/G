const expect = require('chai').expect;
const G = require('../../src/index');

const div = document.createElement('div');
div.id = '83';
document.body.appendChild(div);
describe('83', () => {
  let canvas = new G.Canvas({
    containerId: '83',
    renderer: 'svg',
    width: 500,
    height: 500,
    pixelRatio: 1
  });
  canvas.addShape('path', {
    attrs: {
      path: [
        [ 'M', 166, 196.5 ],
        [ 'L', 166, 206.5 ],
        [ 'L', 166, 261 ],
        [ 'L', 198, 261 ],
        [ 'L', 198, 315.5 ],
        [ 'L', 198, 325.5 ]
      ],
      stroke: 'black'
    }
  });
  canvas.draw();
  const children = canvas.get('children');
  expect(children[0].fill).to.be.undefined;
  expect(children[0].fillStyle).to.be.undefined;
  canvas = new G.Canvas({
    containerId: '83',
    renderer: 'canvas',
    width: 500,
    height: 500,
    pixelRatio: 1
  });
  canvas.set('children', children);
  expect(children[0].fill).to.be.undefined;
  expect(children[0].fillStyle).to.be.undefined;
  canvas.draw();
});

