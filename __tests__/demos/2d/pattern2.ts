import { Circle, Rect } from '@antv/g';
import { dots, lines } from '@antv/g-pattern';
import * as d3 from 'd3';

export async function pattern2(context) {
  const { canvas } = context;
  await canvas.ready;

  const background = new Rect({
    style: {
      width: 16,
      height: 16,
      fill: 'red',
    },
  });
  const dot = new Circle({
    style: {
      cx: 8,
      cy: 8,
      r: 6,
      fill: 'white',
    },
  });
  background.appendChild(dot);

  const rect = new Rect({
    style: {
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      fill: {
        image: background,
        repetition: 'repeat',
        transform: 'rotate(30deg)',
      },
    },
  });
  canvas.appendChild(rect);

  const rect2 = new Rect({
    style: {
      x: 200,
      y: 50,
      width: 100,
      height: 100,
      fill: {
        image: dots({
          fill: 'red',
        }),
        repetition: 'repeat',
      },
    },
  });
  canvas.appendChild(rect2);

  const rect3 = new Rect({
    style: {
      x: 350,
      y: 50,
      width: 100,
      height: 100,
      fill: {
        image: lines({
          stroke: '#000000',
        }),
        repetition: 'repeat',
      },
    },
  });
  canvas.appendChild(rect3);

  const data = [38024.7, 209484.6, 6201.2, 17741.9, 24377.7];
  const colors = ['#e8c1a0', '#f47560', '#f1e15b', '#e8a838', '#61cdbb'];
  const width = 600;
  const sectorArc = d3
    .arc()
    .innerRadius(width / 8)
    .outerRadius(width / 5);
  const tweens = [
    function (sectorData) {
      const currentPath = this.getAttribute('d');
      return d3.interpolate(currentPath, sectorArc(sectorData));
    },
    function (sectorData) {
      const interpolator = d3.interpolate(this._current, sectorData);
      this._current = interpolator(0);
      return (t) => sectorArc(interpolator(t));
    },
  ];
  let svg;

  function drawCharts(data) {
    const pieData = d3.pie().sort(null)(data);
    const sectors = svg.selectAll('path').data(pieData);

    sectors
      .enter()
      .append('path')
      .attr('stroke', 'black')
      .attr('fill', (_, i) => {
        return {
          image: lines({
            backgroundColor: colors[i],
            backgroundOpacity: 0.65,
            stroke: colors[i],
          }),
          repetition: 'repeat',
          transform: 'rotate(30deg)',
        };
      })
      .attr('d', sectorArc)
      .property('_current', (d) => d);

    sectors.transition().duration(1000).attrTween('d', tweens[1]);
  }
  const wrapper = d3.select(
    canvas.document.documentElement, // use GCanvas' document element instead of a real DOM
  );

  const bounds = wrapper
    .append('g')
    .style('transform', `translate(${width / 2}px, ${width / 2}px)`);
  svg = bounds.append('g');

  drawCharts(data);
}
