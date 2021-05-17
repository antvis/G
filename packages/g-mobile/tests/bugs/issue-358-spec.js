import Canvas from '../../src/canvas';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

/* TODO: Need a way to test composite opacity */
describe('#358', () => {
  const canvas = new Canvas({
    container: dom,
    width: 400,
    height: 400,
  });

  it('opacity attr should be composite with parent', () => {
    const group = canvas.addGroup();
    group.addShape({
      type: 'circle',
      attrs: {
        x: 100,
        y: 100,
        r: 20,
        fill: 'red',
        opacity: 0.1,
      },
    });

    group.attr({
      opacity: 0,
    });

    group.animate(
      {
        opacity: 1,
      },
      {
        duration: 500,
      }
    );
  });

  it('opacity attr should be composite with ancestor', () => {
    const group = canvas.addGroup();
    const subGroup = group.addGroup();
    subGroup.addShape({
      type: 'circle',
      attrs: {
        x: 200,
        y: 100,
        r: 20,
        fill: 'red',
      },
    });

    group.attr({
      opacity: 0,
    });

    group.animate(
      {
        opacity: 1,
      },
      {
        duration: 500,
      }
    );
  });

  it('opacity attr should be composite with canvas', () => {
    canvas.addShape({
      type: 'circle',
      attrs: {
        x: 300,
        y: 100,
        r: 20,
        fill: 'red',
      },
    });

    canvas.attr({
      opacity: 0,
    });

    canvas.animate(
      {
        opacity: 1,
      },
      {
        duration: 500,
      }
    );
  });
});
