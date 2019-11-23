const canvas = new G.Canvas({
  container: 'container',
  width: 600,
  height: 500,
});

canvas.addShape('ellipse', {
  attrs: {
    x: 300,
    y: 200,
    rx: 100,
    ry: 150,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    radius: 8,
  },
});
