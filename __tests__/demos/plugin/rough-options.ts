import { Plugin as PluginRoughCanvasRenderer } from '@antv/g-plugin-rough-canvas-renderer';
import { Plugin as PluginRoughSVGRenderer } from '@antv/g-plugin-rough-svg-renderer';
import { Plugin as PluginCSSSelect } from '@antv/g-plugin-css-select';
import * as d3 from 'd3';

export async function roughOptions(context) {
  const { canvas } = context;
  await canvas.ready;

  // Create basic dimensions
  const width = 800;
  const height = 500;
  const margin = { top: 40, right: 40, bottom: 40, left: 40 };
  const contentWidth = width - margin.left - margin.right;
  const contentHeight = height - margin.top - margin.bottom;

  // Create wrapper
  const wrapper = d3.select(canvas.document.documentElement);

  const bounds = wrapper
    .append('g')
    .style('transform', `translate(${margin.left}px, ${margin.top}px)`);

  // First Row - Solid Shapes
  // 1. Rectangle (Solid)
  bounds
    .append('rect')
    .attr('x', 50)
    .attr('y', 50)
    .attr('width', 60)
    .attr('height', 60)
    .attr('fill', '#4CAF50') // Material Green
    .attr('class', 'solid-1');

  // 2. Circle (Solid)
  bounds
    .append('circle')
    .attr('cx', 160)
    .attr('cy', 80)
    .attr('r', 30)
    .attr('fill', '#FF5722') // Material Deep Orange
    .attr('class', 'solid-2');

  // 3. Triangle (Solid)
  bounds
    .append('polygon')
    .attr('points', '240,50 270,110 210,110')
    .attr('fill', '#2196F3') // Material Blue
    .attr('class', 'solid-3');

  // 4. Heart (Solid)
  bounds
    .append('path')
    .attr(
      'd',
      'M 320 100 L 335 85 A 15 15 0 0 1 365 85 L 380 100 L 350 130 L 320 100',
    )
    .attr('fill', '#9C27B0') // Material Purple
    .attr('class', 'solid-4');

  // 5. Ellipse (Solid)
  bounds
    .append('ellipse')
    .attr('cx', 450)
    .attr('cy', 80)
    .attr('rx', 35)
    .attr('ry', 25)
    .attr('fill', '#F44336') // Material Red
    .attr('class', 'solid-5');

  // 6. Star (Solid)
  bounds
    .append('path')
    .attr(
      'd',
      'M 540 80 L 550 60 L 560 80 L 580 85 L 565 100 L 570 120 L 550 110 L 530 120 L 535 100 L 520 85 L 540 80',
    )
    .attr('fill', '#FFC107') // Material Amber
    .attr('class', 'solid-6');

  // 7. Diamond (Solid)
  bounds
    .append('polygon')
    .attr('points', '620,80 650,60 680,80 650,100')
    .attr('fill', '#795548') // Material Brown
    .attr('class', 'solid-7');

  // Second Row - Rough Shapes
  // 1. Rectangle (Rough)
  bounds
    .append('rect')
    .attr('x', 50)
    .attr('y', 200)
    .attr('width', 60)
    .attr('height', 60)
    .attr('fill', '#4CAF50') // Material Green
    .attr('class', 'rough-1');

  // 2. Circle (Rough)
  bounds
    .append('circle')
    .attr('cx', 160)
    .attr('cy', 230)
    .attr('r', 30)
    .attr('fill', '#FF5722') // Material Deep Orange
    .attr('class', 'rough-2');

  // 3. Triangle (Rough)
  bounds
    .append('polygon')
    .attr('points', '240,200 270,260 210,260')
    .attr('fill', '#2196F3') // Material Blue
    .attr('class', 'rough-3');

  // 4. Heart (Rough)
  bounds
    .append('path')
    .attr(
      'd',
      'M 320 250 L 335 235 A 15 15 0 0 1 365 235 L 380 250 L 350 280 L 320 250',
    )
    .attr('fill', '#9C27B0') // Material Purple
    .attr('class', 'rough-4');

  // 5. Ellipse (Rough)
  bounds
    .append('ellipse')
    .attr('cx', 450)
    .attr('cy', 230)
    .attr('rx', 35)
    .attr('ry', 25)
    .attr('fill', '#F44336') // Material Red
    .attr('class', 'rough-5');

  // 6. Star (Rough)
  bounds
    .append('path')
    .attr(
      'd',
      'M 540 230 L 550 210 L 560 230 L 580 235 L 565 250 L 570 270 L 550 260 L 530 270 L 535 250 L 520 235 L 540 230',
    )
    .attr('fill', '#FFC107') // Material Amber
    .attr('class', 'rough-6');

  // 7. Diamond (Rough)
  bounds
    .append('polygon')
    .attr('points', '620,230 650,210 680,230 650,250')
    .attr('fill', '#795548') // Material Brown
    .attr('class', 'rough-7');
}

roughOptions.initRenderer = (renderer, type) => {
  renderer.registerPlugin(new PluginCSSSelect());
  if (type === 'canvas') {
    renderer.registerPlugin(
      new PluginRoughCanvasRenderer({
        roughRendering: (element) => {
          // Only apply rough effect to shapes with class names starting with 'rough-'
          const className = element.getAttribute('class');
          return className?.startsWith('rough-') || false;
        },
      }),
    );
  }
};
