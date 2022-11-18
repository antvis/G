import { Canvas, Group, Circle } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Plugin } from '@antv/g-plugin-css-select';
import chai, { expect } from 'chai';

const $container = document.createElement('div');
$container.id = 'container';
document.body.prepend($container);

const plugin = new Plugin();
const renderer = new CanvasRenderer();
renderer.registerPlugin(plugin);

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer,
});

describe('CSS Select Plugin', () => {
  afterEach(() => {
    canvas.destroyChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should query with advanced selector correctly.', async () => {
    expect(plugin.name).to.be.eqls('css-select');

    await canvas.ready;

    const solarSystem = new Group({
      id: 'solarSystem',
    });
    const earthOrbit = new Group({
      id: 'earthOrbit',
    });
    const moonOrbit = new Group({
      id: 'moonOrbit',
    });

    const sun = new Circle({
      id: 'sun',
      name: 'sun',
      style: {
        r: 100,
        fill: '#1890FF',
        stroke: '#F04864',
        lineWidth: 4,
      },
    });
    const earth = new Circle({
      id: 'earth',
      style: {
        r: 50,
        fill: '#1890FF',
        stroke: '#F04864',
        lineWidth: 4,
      },
    });
    const moon = new Circle({
      id: 'moon',
      style: {
        r: 25,
        fill: '#1890FF',
        stroke: '#F04864',
        lineWidth: 4,
      },
    });

    solarSystem.appendChild(sun);
    solarSystem.appendChild(earthOrbit);
    earthOrbit.appendChild(earth);
    earthOrbit.appendChild(moonOrbit);
    moonOrbit.appendChild(moon);

    solarSystem.setPosition(300, 250);
    earthOrbit.translate(100, 0);
    moonOrbit.translate(100, 0);

    canvas.appendChild(solarSystem);

    expect(solarSystem.querySelector('#sun')).to.eqls(sun);
    expect(solarSystem.querySelectorAll('[r=100]')).to.eqls([sun]);
    expect(solarSystem.querySelectorAll('[r=25]')).to.eqls([moon]);

    expect(solarSystem.querySelectorAll('[fill=#1890FF]')).to.eqls([
      sun,
      earth,
      moon,
    ]);

    expect(solarSystem.querySelectorAll('[line-width=4]')).to.eqls([
      sun,
      earth,
      moon,
    ]);

    expect(solarSystem.querySelectorAll('[xx=4]')).to.eqls([]);

    expect(renderer.getPlugins().length).to.eqls(8);
    renderer.unregisterPlugin(plugin);
    expect(renderer.getPlugins().length).to.eqls(7);

    renderer.unregisterPlugin(plugin);
    expect(renderer.getPlugins().length).to.eqls(7);
  });
});
