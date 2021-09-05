import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';

import { Group, Circle, Canvas, Text, Rect, DISPLAY_OBJECT_EVENT } from '../';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';

chai.use(chaiAlmost());
chai.use(sinonChai);

const $container = document.createElement('div');
$container.id = 'container';
document.body.prepend($container);

const renderer = new CanvasRenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer,
});

describe('Canvas', () => {
  it('should convert client & canvas coords correctly', () => {
    let point = canvas.getClientByPoint(0, 0);
    expect(point.x).eqls(8);
    expect(point.y).eqls(8);

    point = canvas.getPointByClient(8, 8);
    expect(point.x).eqls(0);
    expect(point.y).eqls(0);
  });
});
