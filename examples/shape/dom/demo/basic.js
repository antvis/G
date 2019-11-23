// G_SVG means svg version of G
const canvas = new G_SVG.Canvas({
  container: 'container',
  width: 600,
  height: 500,
});

canvas.addShape('dom', {
  attrs: {
    x: 100,
    y: 50,
    width: 400,
    height: 400,
    html: `
      <h1>This is Title</h1>
      <ul>
        <li>item 1</li>
        <li>item 2</li>
        <li>item 3</li>
      </ul>
      <img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ" width="200" height="200" />`,
  },
});
