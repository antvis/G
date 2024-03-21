import { Renderer as CanvasRenderer } from '../../../packages/g-svg/src';
import { Plugin } from '../../../packages/g-plugin-css-select/src';
import { Canvas, Circle, Group } from '../../../packages/g/src';

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
    expect(plugin.name).toBe('css-select');

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

    expect(solarSystem.querySelector('#sun')).toBe(sun);
    expect(solarSystem.querySelectorAll('[r=100]')).toStrictEqual([sun]);
    expect(solarSystem.querySelectorAll('[r=25]')).toStrictEqual([moon]);

    expect(solarSystem.querySelectorAll('[fill=#1890FF]')).toStrictEqual([
      sun,
      earth,
      moon,
    ]);

    // expect(solarSystem.querySelectorAll('[line-width=4]')).toStrictEqual([
    //   sun,
    //   earth,
    //   moon,
    // ]);

    expect(solarSystem.querySelectorAll('[xx=4]')).toStrictEqual([]);

    expect(renderer.getPlugins().length).toBe(5);
    renderer.unregisterPlugin(plugin);
    expect(renderer.getPlugins().length).toBe(4);

    renderer.unregisterPlugin(plugin);
    expect(renderer.getPlugins().length).toBe(4);
  });
});
