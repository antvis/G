const canvas = new G.Canvas({
  container: 'container',
  width: 600,
  height: 500,
});

canvas.addShape('path', {
  attrs: {
    path: [
      ['M', 100, 100],
      ['L', 200, 200],
    ],
    startArrow: {
      path: 'M 10,0 L -10,-10 L -10,10 Z',
      d: 10,
    },
    stroke: '#F04864',
  },
});

canvas.addShape('path', {
  attrs: {
    path:
      'M 100,300' +
      'l 50,-25' +
      'a25,25 -30 0,1 50,-25' +
      'l 50,-25' +
      'a25,50 -30 0,1 50,-25' +
      'l 50,-25' +
      'a25,75 -30 0,1 50,-25' +
      'l 50,-25' +
      'a25,100 -30 0,1 50,-25' +
      'l 50,-25' +
      'l 0, 200,' +
      'z',
    lineWidth: 10,
    lineJoin: 'round',
    stroke: '#54BECC',
  },
});
