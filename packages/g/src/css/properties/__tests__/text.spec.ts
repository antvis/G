import chai, { expect } from 'chai';
import { Text, Group, Canvas, CSSUnitValue } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { sleep } from '../../../__tests__/utils';

const $container = document.createElement('div');
$container.id = 'container';
document.body.prepend($container);

const renderer = new CanvasRenderer();
const canvas = new Canvas({
  container: 'container',
  width: 100,
  height: 100,
  renderer,
});

/**
 * <text>
 */
describe('CSSPropertyText', () => {
  afterEach(() => {
    canvas.removeChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should parse text correctly.', async () => {
    const text = new Text({
      style: {
        text: '',
      },
    });

    canvas.appendChild(text);

    await sleep(100);

    // attribute
    expect(text.getAttribute('text')).to.be.eqls('');

    // used value
    let used = text.computedStyleMap().get('text') as CSSUnitValue;
    expect(used.toString()).to.be.eqls('unset');
    expect(text.parsedStyle.text).to.be.eqls('');

    text.style.text = 'xxx';
    used = text.computedStyleMap().get('text') as CSSUnitValue;
    expect(used.toString()).to.be.eqls('xxx');
    expect(text.parsedStyle.text).to.be.eqls('xxx');

    text.style.textTransform = 'uppercase';
    expect(text.getAttribute('text')).to.be.eqls('xxx');
    used = text.computedStyleMap().get('text') as CSSUnitValue;
    expect(used.toString()).to.be.eqls('xxx');
    expect(text.parsedStyle.text).to.be.eqls('XXX');

    text.style.textTransform = 'lowercase';
    expect(text.getAttribute('text')).to.be.eqls('xxx');
    used = text.computedStyleMap().get('text') as CSSUnitValue;
    expect(used.toString()).to.be.eqls('xxx');
    expect(text.parsedStyle.text).to.be.eqls('xxx');

    text.style.textTransform = 'capitalize';
    expect(text.getAttribute('text')).to.be.eqls('xxx');
    used = text.computedStyleMap().get('text') as CSSUnitValue;
    expect(used.toString()).to.be.eqls('xxx');
    expect(text.parsedStyle.text).to.be.eqls('Xxx');

    text.style.textTransform = 'none';
    expect(text.getAttribute('text')).to.be.eqls('xxx');
    used = text.computedStyleMap().get('text') as CSSUnitValue;
    expect(used.toString()).to.be.eqls('xxx');
    expect(text.parsedStyle.text).to.be.eqls('xxx');

    const group = new Group({
      style: {
        textTransform: 'uppercase',
      },
    });
    expect(group.getAttribute('textTransform')).to.be.eqls('uppercase');
    used = group.computedStyleMap().get('text') as CSSUnitValue;
    expect(used).to.be.undefined;
  });
});
