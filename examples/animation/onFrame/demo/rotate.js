const canvas = new G.Canvas({
  container: 'container',
  width: 600,
  height: 500,
});

canvas.addShape('circle', {
  attrs: {
    x: 300,
    y: 200,
    r: 50,
    fill: '#1890FF',
  },
});

const circleList = [];

for (let i = 0; i < 6; i++) {
  const circle = canvas.addShape('circle', {
    attrs: {
      x: 300 + 100 * Math.cos((i / 6) * Math.PI * 2),
      y: 200 + 100 * Math.sin((i / 6) * Math.PI * 2),
      r: 20,
      fill: '#F04864',
    },
  });
  circleList.push(circle);
}

circleList.forEach((circle, i) => {
  circle.animate(
    (ratio) => {
      return {
        x: 300 + 100 * Math.cos(ratio * Math.PI * 2 + (i / 6) * Math.PI * 2),
        y: 200 + 100 * Math.sin(ratio * Math.PI * 2 + (i / 6) * Math.PI * 2),
      };
    },
    {
      duration: 3000,
      repeat: true,
    }
  );
});
