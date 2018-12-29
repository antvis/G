const expect = require('chai').expect;
const G = require('../../../../src/index');
const Util = require('../../../../src/util');
const Simulate = require('event-simulate');

describe('event', () => {
  const div = document.createElement('div');
  div.id = 'event';
  document.body.appendChild(div);
  const canvas = new G.Canvas({
    containerId: 'event',
    width: 1000,
    height: 1000,
    renderer: 'svg'
  });
  const group = canvas.addGroup();
  const subGroup = group.addGroup();
  const rect = subGroup.addShape('rect', {
    id: 'element',
    attrs: {
      x: 0,
      y: 0,
      width: 20,
      height: 20,
      fill: 'red'
    }
  });
  canvas.draw();

  it('single event of a type', () => {
    let clicked = false;
    let evt = null;
    rect.on('click', function(event) {
      clicked = true;
      evt = event;
    });
    rect.emit('click', new Event('click'));
    expect(clicked).to.be.true;
    expect(evt).not.to.be.null;

  });
  it('multiple event of the same type', () => {
    let clicked1 = false;
    let clicked2 = false;
    rect.on('click', function() {
      clicked1 = true;
    });
    rect.on('click', function() {
      clicked2 = true;
    });
    rect.emit('click', new Event('click'));
    rect.removeEvent('click');
    expect(clicked1).to.be.true;
    expect(clicked2).to.be.true;
  });
  it('event bubbling', () => {
    let rectClicked = false;
    let groupClicked = false;
    let count = 0;
    rect.on('mousedown', function() {
      rectClicked = true;
    });
    group.on('mousedown', function() {
      groupClicked = true;
      count++;
    });
    const e = Util.clone(new Event('mousedown'));
    e.target = rect;
    rect.emit('mousedown', e);
    rect.removeEvent('mousedown');
    group.removeEvent('mousedown');
    expect(rectClicked).to.be.true;
    expect(groupClicked).to.be.true;
    expect(count).to.equal(1); // prevent bubbling multiple times
  });
  it('mouseenter & mouseleave do not propagate', () => {
    let rectEnter = false;
    let groupEnter = false;
    let rectLeave = false;
    let groupLeave = false;
    rect.on('mouseenter', evt => {
      rectEnter = true;
      expect(evt).not.to.be.undefined;
    });
    rect.on('mouseleave', evt => {
      rectLeave = true;
      expect(evt).not.to.be.undefined;
    });
    group.on('mouseenter', () => {
      groupEnter = true;
    });
    group.on('mouseleave', () => {
      groupLeave = true;
    });

    const e1 = Util.clone(new Event('mousemove'));
    e1.target = rect;
    rect.emit('mouseenter', e1);

    const e2 = Util.clone(new Event('mouseleave'));
    e2.target = rect;
    rect.emit('mouseleave', e2);

    expect(rectEnter).to.be.true;
    expect(rectLeave).to.be.true;
    expect(groupEnter).to.be.false;
    expect(groupLeave).to.be.false;
    rect.removeEvent();
    group.removeEvent();
  });
  it('mouseover & mouseout do propagate', () => {
    let rectEnter = false;
    let groupEnter = false;
    let rectLeave = false;
    let groupLeave = false;
    rect.on('mouseover', evt => {
      rectEnter = true;
      expect(evt).not.to.be.undefined;
    });
    rect.on('mouseout', evt => {
      rectLeave = true;
      expect(evt).not.to.be.undefined;
    });
    group.on('mouseover', () => {
      groupEnter = true;
    });
    group.on('mouseout', () => {
      groupLeave = true;
    });

    const e1 = Util.clone(new Event('mouseover'));
    e1.target = rect;
    rect.emit('mouseover', e1);

    const e2 = Util.clone(new Event('mouseout'));
    e2.target = rect;
    rect.emit('mouseout', e2);

    expect(rectEnter).to.be.true;
    expect(rectLeave).to.be.true;
    expect(groupEnter).to.be.true;
    expect(groupLeave).to.be.true;
  });
  it('off envent', () => {
    let emited = false;
    const fn = function() {
      emited = true;
    };
    rect.on('mouseup', fn);
    rect.emit('mouseup', new Event('mouseup'));
    expect(emited).to.be.true;
    emited = false;
    rect.off('mouseup', fn);
    rect.emit('mouseup', new Event('mouseup'));
    expect(emited).to.be.false;
  });
  it('remove all listeners', () => {
    let count = 0;
    rect.on('mouseup', () => {
      ++count;
    });
    rect.on('mouseup', () => {
      ++count;
    });
    rect.emit('mouseup', new Event('mouseup'));
    expect(count).to.equal(2);
    rect.removeEvent('mouseup');
    rect.emit('mouseup', new Event('mouseup'));
    expect(count).to.equal(2);
  });
  it('dragstart & dragend', () => {
    let rectDrag = false;
    let groupDrag = false;
    let rectEnd = false;
    let groupEnd = false;
    let count = 0;
    rect.on('dragstart', () => {
      rectDrag = true;
    });
    group.on('dragstart', () => {
      groupDrag = true;
    });
    rect.on('dragend', () => {
      rectEnd = true;
    });
    group.on('dragend', () => {
      groupEnd = true;
    });
    rect.on('drag', () => {
      count++;
    });


    const e1 = Util.clone(new Event('dragstart'));
    e1.target = rect;
    rect.emit('dragstart', e1);

    rect.emit('drag', new Event('drag'));

    const e2 = Util.clone(new Event('dragend'));
    e2.target = rect;
    rect.emit('dragend', e2);

    expect(count).to.equal(1);
    rect.removeEvent();
    group.removeEvent();
    expect(rectDrag).to.be.true;
    expect(groupDrag).to.be.true;
    expect(rectEnd).to.be.true;
    expect(groupEnd).to.be.true;
  });
  it('drop shape', () => {
    const bbox = canvas._cfg.el.getBoundingClientRect();
    const circle = canvas.addShape('circle', {
      attrs: {
        x: 50,
        y: 50,
        r: 30,
        fill: '#ccc'
      }
    });
    canvas.draw();
    let target = null;
    circle.on('drop', evt => {
      target = evt.currentTarget;
    });
    Simulate.simulate(canvas._cfg.el, 'mousedown', {
      clientY: bbox.top + 5,
      clientX: bbox.left + 5
    });
    Simulate.simulate(canvas._cfg.el, 'mousemove', {
      clientY: bbox.top + 10,
      clientX: bbox.left + 10
    });
    Simulate.simulate(canvas._cfg.el, 'mousemove', {
      clientY: bbox.top + 15,
      clientX: bbox.left + 15
    });
    Simulate.simulate(canvas._cfg.el, 'mouseup', {
      clientY: bbox.top + 50,
      clientX: bbox.left + 50
    });
    expect(target).not.to.be.undefined;
    expect(target).to.equal(circle);
    circle.removeEvent('drop');
  });
});
