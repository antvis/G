import { Canvas, Group } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { expect } from 'chai';

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
    canvas.removeChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should hide/show itself correctly', async () => {
    const group = new Group();
    expect(group.style.visibility).eqls('');
    expect(group.isVisible()).to.be.false;

    await canvas.ready;
    // append to canvas
    canvas.appendChild(group);

    // inherit from document.documentElement
    expect(group.parsedStyle.visibility.toString()).to.be.eqls('visible');
    expect(group.style.visibility).eqls('');
    expect(group.isVisible()).to.be.true;

    // hide itself
    group.hide();
    expect(group.style.visibility).eqls('hidden');
    expect(group.isVisible()).to.be.false;

    group.show();
    expect(group.style.visibility).eqls('visible');
    expect(group.isVisible()).to.be.true;
  });

  it('should hide/show itself & its children correctly', async () => {
    const group = new Group();
    const child1 = new Group();
    const child2 = new Group();
    group.appendChild(child1);
    group.appendChild(child2);

    expect(group.style.visibility).eqls('');
    expect(child1.style.visibility).eqls('');
    expect(child2.style.visibility).eqls('');

    await canvas.ready;
    // append to document
    canvas.appendChild(group);

    // visible by default
    expect(group.isVisible()).to.be.true;
    expect(child1.isVisible()).to.be.true;
    expect(child2.isVisible()).to.be.true;

    // hide parent group
    group.hide();
    expect(group.style.visibility).eqls('hidden');
    expect(child1.style.visibility).eqls('');
    expect(child2.style.visibility).eqls('');
    expect(group.isVisible()).to.be.false;
    expect(child1.isVisible()).to.be.false;
    expect(child2.isVisible()).to.be.false;

    group.show();
    expect(group.style.visibility).eqls('visible');
    expect(child1.style.visibility).eqls('');
    expect(child2.style.visibility).eqls('');
    expect(group.isVisible()).to.be.true;
    expect(child1.isVisible()).to.be.true;
    expect(child2.isVisible()).to.be.true;
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

    expect(root.style.visibility).eqls('');
    expect(group.style.visibility).eqls('');
    expect(child1.style.visibility).eqls('hidden');
    expect(child2.style.visibility).eqls('');

    await canvas.ready;
    // append to document
    canvas.appendChild(root);

    // visible by default
    expect(root.isVisible()).to.be.true;
    expect(group.isVisible()).to.be.true;
    expect(child1.isVisible()).to.be.false;
    expect(child2.isVisible()).to.be.true;

    // hide parent group
    root.hide();
    expect(root.style.visibility).eqls('hidden');
    expect(group.style.visibility).eqls('');
    expect(child1.style.visibility).eqls('hidden');
    expect(child2.style.visibility).eqls('');
    expect(root.isVisible()).to.be.false;
    expect(group.isVisible()).to.be.false;
    expect(child1.isVisible()).to.be.false;
    expect(child2.isVisible()).to.be.false;

    root.show();
    expect(root.style.visibility).eqls('visible');
    expect(group.style.visibility).eqls('');
    expect(child1.style.visibility).eqls('hidden');
    expect(child2.style.visibility).eqls('');
    expect(root.isVisible()).to.be.true;
    expect(group.isVisible()).to.be.true;
    expect(child1.isVisible()).to.be.false;
    expect(child2.isVisible()).to.be.true;

    child2.hide();
    expect(child2.style.visibility).eqls('hidden');
    expect(child2.isVisible()).to.be.false;

    // restore to initial
    child2.style.visibility = 'initial';
    expect(child2.style.visibility).eqls('initial');
    expect(child2.isVisible()).to.be.true; // inherit from parent

    child2.style.visibility = 'unset';
    expect(child2.style.visibility).eqls('unset');
    expect(child2.isVisible()).to.be.true;
  });
});
