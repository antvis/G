const canvas = new G.Canvas({
  container: 'container',
  width: 600,
  height: 500,
});

canvas.addShape('circle', {
  attrs: {
    x: 300,
    y: 200,
    r: 100,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    radius: 8,
  },
});
