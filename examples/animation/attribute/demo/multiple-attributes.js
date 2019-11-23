const canvas = new G.Canvas({
  container: 'container',
  width: 600,
  height: 500,
});

const group = canvas.addGroup();

const circle = group.addShape('circle', {
  attrs: {
    x: 200,
    y: 100,
    r: 20,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});

circle.animate(
  {
    x: 500,
    y: 400,
    r: 50,
    fill: '#F04864',
  },
  {
    delay: 0,
    duration: 2000,
    easing: 'easeLinear',
    callback: () => {},
    repeat: true,
  }
);
