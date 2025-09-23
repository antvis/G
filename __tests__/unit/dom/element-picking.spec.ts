import { Renderer as SVGRenderer } from '../../../packages/g-svg/src';
import { Canvas, Circle, Group, Rect } from '../../../packages/g/src';
import { sleep } from '../utils';

const $container = document.createElement('div');
$container.id = 'container-linear-picking';
document.body.prepend($container);

/**
 * Test element picking implementation
 * using bounding box intersection detection
 */
describe('Element Picking Tests', () => {
  let canvas: Canvas;
  let svgRenderer: SVGRenderer;

  beforeEach(() => {
    svgRenderer = new SVGRenderer();
  });

  afterEach(() => {
    if (canvas) {
      canvas.destroy();
    }
  });

  describe('SVG Renderer Element Picking', () => {
    beforeEach(async () => {
      canvas = new Canvas({
        container: 'container-linear-picking',
        width: 600,
        height: 500,
        renderer: svgRenderer,
      });
      await canvas.ready;
    });

    it('should handle simple element picking correctly', async () => {
      const circle = new Circle({
        style: {
          r: 50,
          cx: 100,
          cy: 100,
          fill: 'red',
        },
      });
      canvas.appendChild(circle);
      await sleep(100);

      // Test elementsFromBBox functionality
      const elements = canvas.document.elementsFromBBox(50, 50, 150, 150);
      expect(elements).toContain(circle);
      expect(elements).toContain(canvas.document.documentElement);

      // Test that picking works correctly
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should handle overlapping elements correctly', async () => {
      const circle1 = new Circle({
        style: {
          r: 50,
          cx: 100,
          cy: 100,
          fill: 'red',
        },
      });
      const circle2 = new Circle({
        style: {
          r: 50,
          cx: 100,
          cy: 100,
          fill: 'blue',
        },
      });

      canvas.appendChild(circle1);
      canvas.appendChild(circle2);
      await sleep(100);

      const elements = canvas.document.elementsFromBBox(50, 50, 150, 150);

      // Both circles should be found
      expect(elements).toContain(circle1);
      expect(elements).toContain(circle2);
      expect(elements).toContain(canvas.document.documentElement);
    });

    it('should respect pointer-events style', async () => {
      const circle = new Circle({
        style: {
          r: 50,
          cx: 100,
          cy: 100,
          fill: 'red',
          pointerEvents: 'none',
        },
      });
      canvas.appendChild(circle);
      await sleep(100);

      // Should not pick non-interactive elements
      const elements = canvas.document.elementsFromBBox(50, 50, 150, 150);
      expect(elements).not.toContain(circle);
      expect(elements).toContain(canvas.document.documentElement);
    });

    it('should respect visibility style', async () => {
      const circle = new Circle({
        style: {
          r: 50,
          cx: 100,
          cy: 100,
          fill: 'red',
          visibility: 'hidden',
        },
      });
      canvas.appendChild(circle);
      await sleep(100);

      // Should not pick hidden elements
      const elements = canvas.document.elementsFromBBox(50, 50, 150, 150);
      expect(elements).not.toContain(circle);
    });

    it('should handle performance with many elements', async () => {
      const elements: Circle[] = [];

      // Create 100 circles (reasonable for testing)
      for (let i = 0; i < 100; i++) {
        const circle = new Circle({
          style: {
            r: Math.random() * 10 + 5,
            cx: Math.random() * 600,
            cy: Math.random() * 500,
            fill: `hsl(${Math.random() * 360}, 70%, 60%)`,
          },
        });
        elements.push(circle);
        canvas.appendChild(circle);
      }

      await sleep(200);

      // Test performance of elementsFromBBox
      const start = performance.now();
      const foundElements = canvas.document.elementsFromBBox(0, 0, 600, 500);
      const end = performance.now();

      // Should complete in reasonable time (< 20ms for 100 elements)
      expect(end - start).toBeLessThan(20);

      // Should find most elements
      expect(foundElements.length).toBeGreaterThan(50);

      console.log(
        `Element picking performance: ${(end - start).toFixed(2)}ms for ${foundElements.length} elements`,
      );
    });

    it('should handle nested groups correctly', async () => {
      const group = new Group();
      const circle = new Circle({
        style: {
          r: 50,
          cx: 100,
          cy: 100,
          fill: 'red',
        },
      });

      group.appendChild(circle);
      canvas.appendChild(group);
      await sleep(100);

      const elements = canvas.document.elementsFromBBox(50, 50, 150, 150);
      expect(elements).toContain(circle);
      expect(elements).toContain(canvas.document.documentElement);
    });

    it('should handle region queries correctly', async () => {
      const rect1 = new Rect({
        style: {
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          fill: 'red',
        },
      });

      const rect2 = new Rect({
        style: {
          x: 200,
          y: 200,
          width: 100,
          height: 100,
          fill: 'blue',
        },
      });

      canvas.appendChild(rect1);
      canvas.appendChild(rect2);
      await sleep(100);

      // Query that should only hit rect1
      let foundElements = canvas.document.elementsFromBBox(0, 0, 150, 150);
      expect(foundElements).toContain(rect1);
      expect(foundElements).not.toContain(rect2);

      // Query that should only hit rect2
      foundElements = canvas.document.elementsFromBBox(150, 150, 350, 350);
      expect(foundElements).toContain(rect2);
      expect(foundElements).not.toContain(rect1);

      // Query that should hit both
      foundElements = canvas.document.elementsFromBBox(0, 0, 350, 350);
      expect(foundElements).toContain(rect1);
      expect(foundElements).toContain(rect2);
    });

    it('should demonstrate good performance scaling', async () => {
      const elementCounts = [10, 50, 100];
      const timings: number[] = [];

      for (const count of elementCounts) {
        // Clear previous elements
        canvas.destroyChildren();

        // Create elements
        for (let i = 0; i < count; i++) {
          const circle = new Circle({
            style: {
              r: 5,
              cx: Math.random() * 600,
              cy: Math.random() * 500,
              fill: 'red',
            },
          });
          canvas.appendChild(circle);
        }

        await sleep(100);

        // Measure picking performance
        const start = performance.now();
        canvas.document.elementsFromBBox(0, 0, 600, 500);
        const end = performance.now();

        timings.push(end - start);
        console.log(`${count} elements: ${(end - start).toFixed(2)}ms`);
      }

      // All timings should be reasonable
      timings.forEach((timing) => {
        expect(timing).toBeLessThan(50); // Should be fast
      });
    });
  });
});
