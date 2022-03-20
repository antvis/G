import chai, { expect } from 'chai';
import { Canvas, Text, Group } from '../../../lib';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';

const $container = document.createElement('div');
$container.id = 'container';
document.body.prepend($container);

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: new CanvasRenderer(),
});

const text = new Text();

describe('Inherit value', () => {
  afterAll(() => {
    canvas.destroy();
  });

  it('should inherit fontSize from parent', () => {
    expect(text.parsedStyle.fontSize).to.be.eqls({ unit: '', value: 0 });

    const group = new Group({
      style: {
        fontSize: 12,
      },
    });
    canvas.appendChild(group);
    group.appendChild(text);
    expect(text.parsedStyle.fontSize).to.be.eqls({ unit: 'px', value: 12 });

    // change parent's fontSize
    group.setAttribute('fontSize', '20px');
    expect(text.parsedStyle.fontSize).to.be.eqls({ unit: 'px', value: 20 });

    group.setAttribute('fontSize', '2.0em');
    expect(text.parsedStyle.fontSize).to.be.eqls({ unit: 'px', value: 32 });

    // document's fontSize is 16px
    group.setAttribute('fontSize', 'inherit');
    expect(text.parsedStyle.fontSize).to.be.eqls({ unit: 'px', value: 16 });

    text.setAttribute('fontSize', 30);
    expect(text.parsedStyle.fontSize).to.be.eqls({ unit: 'px', value: 30 });
  });
});
