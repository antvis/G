import { Renderer as CanvasRenderer } from '../../../packages/g-svg/src';
import { Canvas, Group } from '../../../packages/g/src';

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

describe('Mixin Visible', () => {
  afterEach(() => {
    canvas.destroyChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should hide/show itself correctly', async () => {
    const group = new Group();
    expect(group.style.visibility).toBeUndefined();
    expect(group.isVisible()).toBeTruthy();

    await canvas.ready;
    // append to canvas
    canvas.appendChild(group);

    // inherit from document.documentElement
    expect(group.parsedStyle.visibility).toBeUndefined();
    expect(group.style.visibility).toBeUndefined();
    expect(group.isVisible()).toBeTruthy();

    // hide itself
    group.hide();
    expect(group.style.visibility).toBe('hidden');
    expect(group.isVisible()).toBeFalsy();

    group.show();
    expect(group.style.visibility).toBe('visible');
    expect(group.isVisible()).toBeTruthy();
  });

  it('should hide/show itself & its children correctly', async () => {
    const group = new Group();
    const child1 = new Group();
    const child2 = new Group();
    group.appendChild(child1);
    group.appendChild(child2);

    expect(group.style.visibility).toBeUndefined();
    expect(child1.style.visibility).toBeUndefined();
    expect(child2.style.visibility).toBeUndefined();

    await canvas.ready;
    // append to document
    canvas.appendChild(group);

    // visible by default
    expect(group.isVisible()).toBeTruthy();
    expect(child1.isVisible()).toBeTruthy();
    expect(child2.isVisible()).toBeTruthy();

    // hide parent group
    group.hide();
    expect(group.style.visibility).toBe('hidden');
    expect(child1.style.visibility).toBe('hidden');
    expect(child2.style.visibility).toBe('hidden');
    expect(group.isVisible()).toBeFalsy();
    expect(child1.isVisible()).toBeFalsy();
    expect(child2.isVisible()).toBeFalsy();

    group.show();
    expect(group.style.visibility).toBe('visible');
    expect(child1.style.visibility).toBe('visible');
    expect(child2.style.visibility).toBe('visible');
    expect(group.isVisible()).toBeTruthy();
    expect(child1.isVisible()).toBeTruthy();
    expect(child2.isVisible()).toBeTruthy();
  });

  it('should hide/show with a deeper hierarchy correctly', async () => {
    const root = new Group();
    const group = new Group();
    const child1 = new Group({
      style: {
        visibility: 'hidden',
      },
    });
    const child2 = new Group();
    root.appendChild(group);
    group.appendChild(child1);
    group.appendChild(child2);

    expect(root.style.visibility).toBeUndefined();
    expect(group.style.visibility).toBeUndefined();
    expect(child1.style.visibility).toBe('hidden');
    expect(child2.style.visibility).toBeUndefined();

    // expect(root.style.visibility).toBe('');
    // expect(group.style.visibility).toBe('');
    // expect(child1.style.visibility).toBe('hidden');
    // expect(child2.style.visibility).toBe('');

    await canvas.ready;
    // append to document
    canvas.appendChild(root);

    // visible by default
    expect(root.isVisible()).toBeTruthy();
    expect(group.isVisible()).toBeTruthy();
    expect(child1.isVisible()).toBeFalsy();
    expect(child2.isVisible()).toBeTruthy();

    // hide parent group
    root.hide();
    expect(root.style.visibility).toBe('hidden');
    expect(group.style.visibility).toBe('hidden');
    expect(child1.style.visibility).toBe('hidden');
    expect(child2.style.visibility).toBe('hidden');
    expect(root.isVisible()).toBeFalsy();
    expect(group.isVisible()).toBeFalsy();
    expect(child1.isVisible()).toBeFalsy();
    expect(child2.isVisible()).toBeFalsy();

    root.show();
    expect(root.style.visibility).toBe('visible');
    expect(group.style.visibility).toBe('visible');
    expect(child1.style.visibility).toBe('visible');
    expect(child2.style.visibility).toBe('visible');
    expect(root.isVisible()).toBeTruthy();
    expect(group.isVisible()).toBeTruthy();
    expect(child1.isVisible()).toBeTruthy();
    expect(child2.isVisible()).toBeTruthy();

    child2.hide();
    expect(child2.style.visibility).toBe('hidden');
    expect(child2.isVisible()).toBeFalsy();

    // restore to initial
    child2.style.visibility = 'initial';
    expect(child2.style.visibility).toBe('initial');
    expect(child2.isVisible()).toBeTruthy(); // inherit from parent

    child2.style.visibility = 'unset';
    expect(child2.style.visibility).toBe('unset');
    expect(child2.isVisible()).toBeTruthy();
  });
});
