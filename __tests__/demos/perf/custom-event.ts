import { Canvas, ElementEvent, Rect, Group, CustomEvent } from '@antv/g';
import * as tinybench from 'tinybench';
import * as lil from 'lil-gui';
import { BenchmarkPanel, BenchmarkResult } from './benchmark-panel';

/**
 * Custom Event Performance Test
 * Compare performance between sharing a single event instance and creating new event instances each time
 */
export async function customEvent(context: { canvas: Canvas; gui: lil.GUI }) {
  const { canvas, gui } = context;
  console.log(canvas);

  await canvas.ready;

  const { width, height } = canvas.getConfig();
  const root = new Group();
  let count = 1e4;
  let rects = [];

  // Shared event instance
  const sharedEvent = new CustomEvent(ElementEvent.BOUNDS_CHANGED);

  function render() {
    root.destroyChildren();
    rects = [];

    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 10 + Math.random() * 40;

      const rect = new Rect({
        style: {
          x,
          y,
          width: size,
          height: size,
          fill: 'white',
          stroke: '#000',
          lineWidth: 1,
        },
      });
      root.appendChild(rect);
      rects[i] = { x, y, size, el: rect };
    }
  }

  render();
  canvas.appendChild(root);

  // benchmark
  // ----------
  const bench = new tinybench.Bench({
    name: 'Custom Event Performance Comparison',
    time: 1e3,
    iterations: 100,
  });

  // Test performance of shared event instance
  // Update event properties each time to simulate realistic usage
  bench.add('Shared Event Instance', () => {
    rects.forEach((rect) => {
      // Update event properties to simulate realistic usage
      sharedEvent.detail = {
        affectChildren: true,
        timestamp: performance.now(),
      };
      rect.el.dispatchEvent(sharedEvent);
    });
  });

  // Test performance of creating new event instances each time
  bench.add('New Event Instance', () => {
    rects.forEach((rect) => {
      const event = new CustomEvent(ElementEvent.BOUNDS_CHANGED);
      event.detail = {
        affectChildren: true,
        timestamp: performance.now(),
      };
      rect.el.dispatchEvent(event);
    });
  });

  // Test performance of creating same number of events but dispatching only once on root
  bench.add('Create Events, Dispatch Once on Root', () => {
    const events = [];
    // Create same number of event instances
    for (let i = 0; i < count; i++) {
      const event = new CustomEvent(ElementEvent.BOUNDS_CHANGED);
      event.detail = {
        affectChildren: true,
        timestamp: performance.now(),
      };
      events.push(event);
    }
    // But dispatch only once on root
    root.dispatchEvent(events[0]);
  });

  // Test performance of dispatching event on each element without sharing event instance
  bench.add('Dispatch on Each Element', () => {
    rects.forEach((rect) => {
      const event = new CustomEvent(ElementEvent.BOUNDS_CHANGED);
      event.detail = {
        affectChildren: true,
        timestamp: performance.now(),
      };
      rect.el.dispatchEvent(event);
    });
  });

  // Create benchmark panel
  const benchmarkPanel = new BenchmarkPanel(bench.name);

  // Show initial status with object count
  benchmarkPanel.showRunningStatus(`Object Count: ${count}`);

  // ----------

  // GUI
  const config = {
    objectCount: count,
    runBenchmark: async () => {
      benchmarkPanel.showRunningStatus(`Object Count: ${count}`);

      setTimeout(async () => {
        await bench.run();
        console.log(bench.name);
        console.table(bench.table());

        benchmarkPanel.updateResultsDisplay(
          bench.table() as unknown as BenchmarkResult[],
        );
      }, 1e2);
    },
  };

  gui.add(config, 'objectCount', 100, 50000, 100).onChange((value) => {
    count = value;
    render();
  });

  gui.add(config, 'runBenchmark');
}
