const canvas = new G.Canvas({
  container: 'container',
  width: 600,
  height: 500,
});

canvas.addShape('polyline', {
  attrs: {
    points: [
      [50, 50],
      [100, 50],
      [100, 100],
      [150, 100],
      [150, 150],
      [200, 150],
      [200, 200],
      [250, 200],
      [250, 250],
      [300, 250],
      [300, 300],
      [350, 300],
      [350, 350],
      [400, 350],
      [400, 400],
      [450, 400],
    ],
    stroke: '#1890FF',
    lineWidth: 2,
  },
});
