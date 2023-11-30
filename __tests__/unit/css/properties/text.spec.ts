import { Renderer as CanvasRenderer } from '../../../../packages/g-svg/src';
import { Canvas, CSSUnitValue, Group, Text } from '../../../../packages/g/src';

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
describe.skip('CSSPropertyText', () => {
  afterEach(() => {
    canvas.destroyChildren();
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

    await canvas.ready;
    canvas.appendChild(text);

    // attribute
    expect(text.getAttribute('text')).toBe('');

    // used value
    let used = text.computedStyleMap().get('text') as CSSUnitValue;
    expect(used.toString()).toBe('unset');
    expect(text.parsedStyle.text).toBe('');

    text.style.text = 'xxx';
    used = text.computedStyleMap().get('text') as CSSUnitValue;
    expect(used.toString()).toBe('xxx');
    expect(text.parsedStyle.text).toBe('xxx');

    text.style.textTransform = 'uppercase';
    expect(text.getAttribute('text')).toBe('xxx');
    used = text.computedStyleMap().get('text') as CSSUnitValue;
    expect(used.toString()).toBe('xxx');
    expect(text.parsedStyle.text).toBe('XXX');

    text.style.textTransform = 'lowercase';
    expect(text.getAttribute('text')).toBe('xxx');
    used = text.computedStyleMap().get('text') as CSSUnitValue;
    expect(used.toString()).toBe('xxx');
    expect(text.parsedStyle.text).toBe('xxx');

    text.style.textTransform = 'capitalize';
    expect(text.getAttribute('text')).toBe('xxx');
    used = text.computedStyleMap().get('text') as CSSUnitValue;
    expect(used.toString()).toBe('xxx');
    expect(text.parsedStyle.text).toBe('Xxx');

    text.style.textTransform = 'none';
    expect(text.getAttribute('text')).toBe('xxx');
    used = text.computedStyleMap().get('text') as CSSUnitValue;
    expect(used.toString()).toBe('xxx');
    expect(text.parsedStyle.text).toBe('xxx');

    const group = new Group({
      style: {
        textTransform: 'uppercase',
      },
    });
    expect(group.getAttribute('textTransform')).toBe('uppercase');
    used = group.computedStyleMap().get('text') as CSSUnitValue;
    expect(used).toBeUndefined();
  });
});
