import { Canvas } from '@antv/g';
import { Renderer } from '@antv/g-canvas';
import { Plugin as PluginRoughCanvasRenderer } from '@antv/g-plugin-rough-canvas-renderer';
import * as Plot from '@observablehq/plot';

// create a renderer
const canvasRenderer = new Renderer();
canvasRenderer.registerPlugin(new PluginRoughCanvasRenderer());

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 640,
  height: 400,
  renderer: canvasRenderer,
});

(async () => {
  const res = await fetch(
    'https://gw.alipayobjects.com/os/bmw-prod/b8954a70-dcc7-4868-9b85-5e291ba8d5db.json',
  );
  const athletes = await res.json();

  Plot.dot(athletes, {
    x: 'weight',
    y: 'height',
    stroke: 'sex',
  }).plot({
    document: canvas.document,
  });
})();
