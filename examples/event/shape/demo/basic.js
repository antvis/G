const canvas = new G.Canvas({
  container: 'container',
  width: 600,
  height: 500,
});

const circle = canvas.addShape('circle', {
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

circle.on('mouseenter', () => {
  circle.attr('fill', '#2FC25B');
});

circle.on('mouseleave', () => {
  circle.attr('fill', '#1890FF');
});
