import { Renderer as CanvasRenderer } from '../../../packages/g-svg/src';
import { Canvas, Text } from '../../../packages/g/src';
import { OffscreenCanvasContext } from '../offscreenCanvasContext';

const $container = document.createElement('div');
$container.id = 'container';
document.body.prepend($container);

const renderer = new CanvasRenderer();

const offscreenNodeCanvas = {
  getContext: () => context,
} as unknown as HTMLCanvasElement;
const context = new OffscreenCanvasContext(offscreenNodeCanvas);

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer,
  offscreenCanvas: offscreenNodeCanvas as any,
});

describe('TextDecoration', () => {
  afterEach(() => {
    canvas.destroyChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should apply underline decoration correctly', async () => {
    await canvas.ready;

    const text = new Text({
      style: {
        x: 100,
        y: 100,
        text: 'Underline Text',
        fontSize: 20,
        fill: 'black',
        textDecorationLine: 'underline',
        textDecorationColor: 'red',
        textDecorationStyle: 'solid',
      },
    });

    canvas.appendChild(text);

    // Check that the properties are set correctly
    expect(text.style.textDecorationLine).toBe('underline');
    expect(text.style.textDecorationColor).toBe('red');
    expect(text.style.textDecorationStyle).toBe('solid');

    // Check parsed style
    expect(text.parsedStyle.textDecorationLine).toBe('underline');
  });

  it('should apply overline decoration correctly', async () => {
    await canvas.ready;

    const text = new Text({
      style: {
        x: 100,
        y: 150,
        text: 'Overline Text',
        fontSize: 20,
        fill: 'black',
        textDecorationLine: 'overline',
        textDecorationColor: 'blue',
        textDecorationStyle: 'solid',
      },
    });

    canvas.appendChild(text);

    expect(text.style.textDecorationLine).toBe('overline');
    expect(text.style.textDecorationColor).toBe('blue');
    expect(text.style.textDecorationStyle).toBe('solid');
  });

  it('should apply line-through decoration correctly', async () => {
    await canvas.ready;

    const text = new Text({
      style: {
        x: 100,
        y: 200,
        text: 'Line-through Text',
        fontSize: 20,
        fill: 'black',
        textDecorationLine: 'line-through',
        textDecorationColor: 'green',
        textDecorationStyle: 'solid',
      },
    });

    canvas.appendChild(text);

    expect(text.style.textDecorationLine).toBe('line-through');
    expect(text.style.textDecorationColor).toBe('green');
    expect(text.style.textDecorationStyle).toBe('solid');
  });

  it('should apply multiple decorations correctly', async () => {
    await canvas.ready;

    const text = new Text({
      style: {
        x: 100,
        y: 250,
        text: 'Multiple Decorations',
        fontSize: 20,
        fill: 'black',
        textDecorationLine: 'underline overline',
        textDecorationColor: 'purple',
        textDecorationStyle: 'solid',
      },
    });

    canvas.appendChild(text);

    expect(text.style.textDecorationLine).toBe('underline overline');
    expect(text.style.textDecorationColor).toBe('purple');
    expect(text.style.textDecorationStyle).toBe('solid');
  });

  it('should apply different decoration styles correctly', async () => {
    await canvas.ready;

    // Test dashed underline
    const text1 = new Text({
      style: {
        x: 100,
        y: 300,
        text: 'Dashed Underline',
        fontSize: 20,
        fill: 'black',
        textDecorationLine: 'underline',
        textDecorationColor: 'orange',
        textDecorationStyle: 'dashed',
      },
    });

    canvas.appendChild(text1);

    expect(text1.style.textDecorationLine).toBe('underline');
    expect(text1.style.textDecorationColor).toBe('orange');
    expect(text1.style.textDecorationStyle).toBe('dashed');

    // Test dotted underline
    const text2 = new Text({
      style: {
        x: 100,
        y: 350,
        text: 'Dotted Underline',
        fontSize: 20,
        fill: 'black',
        textDecorationLine: 'underline',
        textDecorationColor: 'brown',
        textDecorationStyle: 'dotted',
      },
    });

    canvas.appendChild(text2);

    expect(text2.style.textDecorationLine).toBe('underline');
    expect(text2.style.textDecorationColor).toBe('brown');
    expect(text2.style.textDecorationStyle).toBe('dotted');

    // Test wavy underline
    const text3 = new Text({
      style: {
        x: 100,
        y: 400,
        text: 'Wavy Underline',
        fontSize: 20,
        fill: 'black',
        textDecorationLine: 'underline',
        textDecorationColor: 'pink',
        textDecorationStyle: 'wavy',
      },
    });

    canvas.appendChild(text3);

    expect(text3.style.textDecorationLine).toBe('underline');
    expect(text3.style.textDecorationColor).toBe('pink');
    expect(text3.style.textDecorationStyle).toBe('wavy');
  });

  it('should remove decoration when set to none', async () => {
    await canvas.ready;

    const text = new Text({
      style: {
        x: 100,
        y: 450,
        text: 'No Decoration',
        fontSize: 20,
        fill: 'black',
        textDecorationLine: 'none',
      },
    });

    canvas.appendChild(text);

    expect(text.style.textDecorationLine).toBe('none');
  });

  it('should handle empty or invalid decoration values', async () => {
    await canvas.ready;

    const text = new Text({
      style: {
        x: 100,
        y: 500,
        text: 'Empty Decoration',
        fontSize: 20,
        fill: 'black',
        textDecorationLine: '',
      },
    });

    canvas.appendChild(text);

    expect(text.style.textDecorationLine).toBe('');
  });

  it('should apply text decoration thickness correctly', async () => {
    await canvas.ready;

    const text = new Text({
      style: {
        x: 100,
        y: 550,
        text: 'Thick Underline',
        fontSize: 20,
        fill: 'black',
        textDecorationLine: 'underline',
        textDecorationColor: 'red',
        textDecorationStyle: 'solid',
        textDecorationThickness: 3,
      },
    });

    canvas.appendChild(text);

    expect(text.style.textDecorationLine).toBe('underline');
    expect(text.style.textDecorationColor).toBe('red');
    expect(text.style.textDecorationStyle).toBe('solid');
    expect(text.style.textDecorationThickness).toBe(3);

    // Check parsed style
    expect(text.parsedStyle.textDecorationThickness).toBe(3);
  });

  it('should apply text decoration thickness with string value', async () => {
    await canvas.ready;

    const text = new Text({
      style: {
        x: 100,
        y: 600,
        text: 'Thick Dashed',
        fontSize: 20,
        fill: 'black',
        textDecorationLine: 'underline',
        textDecorationColor: 'blue',
        textDecorationStyle: 'dashed',
        textDecorationThickness: 4,
      },
    });

    canvas.appendChild(text);

    expect(text.style.textDecorationLine).toBe('underline');
    expect(text.style.textDecorationColor).toBe('blue');
    expect(text.style.textDecorationStyle).toBe('dashed');
    expect(text.style.textDecorationThickness).toBe(4);
  });
});
