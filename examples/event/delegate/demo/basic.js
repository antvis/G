import { Canvas } from '@antv/g-canvas';

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
});

const group = canvas.addGroup();

const circle = group.addShape('circle', {
  name: 'circle',
  attrs: {
    x: 300,
    y: 200,
    r: 100,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    cursor: 'pointer',
  },
});

// event delegation by name
group.on('circle:mouseenter', () => {
  circle.attr('fill', '#2FC25B');
});

group.on('circle:mouseleave', () => {
  circle.attr('fill', '#1890FF');
});
