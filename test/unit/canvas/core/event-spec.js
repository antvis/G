const expect = require('chai').expect;
const G = require('../../../../src/index');
const Simulate = require('event-simulate');

const div = document.createElement('div');
div.id = 'canvas-event';
document.body.appendChild(div);
const canvas = new G.Canvas({
  containerId: 'canvas-event',
  width: 200,
  height: 200,
  pixelRatio: 2
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
describe('event emitter', () => {
  let count = 0;
  const fn1 = () => { count++; };
  const fn2 = () => { count++; };
  const fn3 = () => { count++; };
  it('on & emit & off', () => {
    const path = new G.Path();
    path.on('event', fn1);
    expect(path._cfg._events.event).not.to.be.undefined;
    expect(path._cfg._events.event.length).to.equal(1);
    expect(path._cfg._events.event[0].callback).to.equal(fn1);
    expect(!!path._cfg._events.event[0].one).to.be.false;
    path.one('event', fn2);
    expect(path._cfg._events.event.length).to.equal(2);
    expect(path._cfg._events.event[1].callback).to.equal(fn2);
    expect(!!path._cfg._events.event[1].one).to.be.true;
    path.on('event', fn3);
    expect(path._cfg._events.event.length).to.equal(3);
    expect(path._cfg._events.event[2].callback).to.equal(fn3);
    expect(!!path._cfg._events.event[2].one).to.be.false;
    path.emit('event');
    expect(path._cfg._events.event.length).to.equal(2);
    expect(path._cfg._events.event[0].callback).to.equal(fn1);
    expect(path._cfg._events.event[1].callback).to.equal(fn3);
    expect(count).to.equal(3);
    path.off('event', fn1);
    expect(path._cfg._events.event.length).to.equal(1);
    expect(path._cfg._events.event[0].callback).to.equal(fn3);
    path.removeEvent('event');
    expect(path._cfg._events.event).to.be.undefined;
  });
});
describe('event dispatcher', () => {
  it('single event of a type', () => {
    const bbox = canvas._cfg.el.getBoundingClientRect();
    /* rect.on('click', function(event) {
      clicked = true;
      evt = event;
      expect(event.x).to.equal(6);
      expect(event.y).to.equal(6);
    });*/
    Simulate.simulate(canvas._cfg.el, 'mousedown', {
      clientY: bbox.top + 5,
      clientX: bbox.left + 5
    });
    Simulate.simulate(canvas._cfg.el, 'mouseup', {
      clientY: bbox.top + 6,
      clientX: bbox.left + 6
    });
  });
  it('multiple event of the same type', () => {
    const bbox = canvas._cfg.el.getBoundingClientRect();
    let clicked1 = false;
    let clicked2 = false;
    rect.on('mousedown', function() {
      clicked1 = true;
    });
    rect.on('mousedown', function() {
      clicked2 = true;
    });
    Simulate.simulate(canvas._cfg.el, 'mousedown', {
      clientY: bbox.top + 5,
      clientX: bbox.left + 5
    });
    rect.removeEvent('mousedown');
    expect(clicked1).to.be.true;
    expect(clicked2).to.be.true;
  });
  it('event bubbling', () => {
    const bbox = canvas._cfg.el.getBoundingClientRect();
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
    Simulate.simulate(canvas._cfg.el, 'mousedown', {
      clientY: bbox.top + 5,
      clientX: bbox.left + 5
    });
    rect.removeEvent('mousedown');
    group.removeEvent('mousedown');
    expect(rectClicked).to.be.true;
    expect(groupClicked).to.be.true;
    expect(count).to.equal(1); // prevent bubbling multiple times
  });
  it('mouseenter & mouseleave do not propagate', () => {
    const bbox = canvas._cfg.el.getBoundingClientRect();
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
    Simulate.simulate(canvas._cfg.el, 'mousemove', {
      clientY: bbox.top + 5,
      clientX: bbox.left + 5
    });
    Simulate.simulate(canvas._cfg.el, 'mousemove', {
      clientY: bbox.top + 50,
      clientX: bbox.left + 50
    });
    expect(rectEnter).to.be.true;
    expect(rectLeave).to.be.true;
    expect(groupEnter).to.be.false;
    expect(groupLeave).to.be.false;
    rect.removeEvent();
    group.removeEvent();
  });
  it('mouseover & mouseout do propagate', () => {
    const bbox = canvas._cfg.el.getBoundingClientRect();
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
    Simulate.simulate(canvas._cfg.el, 'mousemove', {
      clientY: bbox.top + 5,
      clientX: bbox.left + 5
    });
    Simulate.simulate(canvas._cfg.el, 'mousemove', {
      clientY: bbox.top + 50,
      clientX: bbox.left + 50
    });
    expect(rectEnter).to.be.true;
    expect(rectLeave).to.be.true;
    expect(groupEnter).to.be.true;
    expect(groupLeave).to.be.true;
  });
  it('off envent', () => {
    const bbox = canvas._cfg.el.getBoundingClientRect();
    let triggered = false;
    const fn = function() {
      triggered = true;
    };
    rect.on('mouseup', fn);
    Simulate.simulate(canvas._cfg.el, 'mouseup', {
      clientY: bbox.top + 5,
      clientX: bbox.left + 5
    });
    expect(triggered).to.be.true;
    triggered = false;
    rect.off('mouseup', fn);
    Simulate.simulate(canvas._cfg.el, 'mouseup', {
      clientY: bbox.top + 5,
      clientX: bbox.left + 5
    });
    expect(triggered).to.be.false;
  });
  it('remove all listeners', () => {
    const bbox = canvas._cfg.el.getBoundingClientRect();
    let count = 0;
    rect.on('mouseup', () => {
      ++count;
    });
    rect.on('mouseup', () => {
      ++count;
    });
    Simulate.simulate(canvas._cfg.el, 'mouseup', {
      clientY: bbox.top + 5,
      clientX: bbox.left + 5
    });
    expect(count).to.equal(2);

    rect.removeEvent('mouseup');
    Simulate.simulate(canvas._cfg.el, 'mouseup', {
      clientY: bbox.top + 5,
      clientX: bbox.left + 5
    });
    expect(count).to.equal(2);
  });
  it('dragstart & dragend', () => {
    const bbox = canvas._cfg.el.getBoundingClientRect();
    let rectDrag = false;
    let groupDrag = false;
    let rectEnd = false;
    let groupEnd = false;
    let clicked = false;
    let count = 0;
    let mousemove = 0;
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
      ++count;
    });
    rect.on('mousemove', () => {
      ++mousemove;
    });
    rect.on('click', () => {
      clicked = true;
    });
    Simulate.simulate(canvas._cfg.el, 'mousedown', {
      clientY: bbox.top + 5,
      clientX: bbox.left + 5
    });
    expect(rectDrag).to.be.false;
    expect(groupDrag).to.be.false;
    expect(rectEnd).to.be.false;
    expect(groupEnd).to.be.false;
    expect(clicked).to.be.false;
    Simulate.simulate(canvas._cfg.el, 'mousemove', {
      clientY: bbox.top + 15,
      clientX: bbox.left + 15
    });
    expect(rectDrag).to.be.true;
    expect(groupDrag).to.be.true;
    expect(rectEnd).to.be.false;
    expect(groupEnd).to.be.false;
    expect(clicked).to.be.false;
    Simulate.simulate(canvas._cfg.el, 'mousemove', {
      clientY: bbox.top + 10,
      clientX: bbox.left + 10
    });
    expect(count).to.equal(1);
    expect(mousemove).to.equal(1);
    Simulate.simulate(canvas._cfg.el, 'mouseup', {
      clientY: bbox.top + 12,
      clientX: bbox.left + 12
    });
    rect.removeEvent();
    group.removeEvent();
    expect(rectEnd).to.be.true;
    expect(groupEnd).to.be.true;
    expect(clicked).to.be.false;
  });
  it('dragenter & dragleave', () => {
    const bbox = canvas._cfg.el.getBoundingClientRect();
    const circle = canvas.addShape('circle', {
      attrs: {
        x: 50,
        y: 50,
        r: 30,
        fill: '#ccc'
      }
    });
    let enter = false;
    let leave = false;
    canvas.draw();
    circle.on('dragenter', () => {
      enter = true;
    });
    circle.on('dragleave', () => {
      leave = true;
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
    Simulate.simulate(canvas._cfg.el, 'mousemove', {
      clientY: bbox.top + 50,
      clientX: bbox.left + 50
    });
    Simulate.simulate(canvas._cfg.el, 'mousemove', {
      clientY: bbox.top + 250,
      clientX: bbox.left + 250
    });
    expect(enter).to.be.true;
    expect(leave).to.be.true;
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
  it('destroyed shape event', () => {
    let count = 0;
    const bbox = canvas._cfg.el.getBoundingClientRect();
    const circle = canvas.addShape('circle', {
      attrs: {
        x: 50,
        y: 50,
        r: 30,
        fill: '#ccc',
        cursor: 'pointer'
      }
    });
    canvas.draw();
    circle.on('mousedown', () => {
      count += 1;
    });
    Simulate.simulate(canvas._cfg.el, 'mousedown', {
      clientX: bbox.left + 30,
      clientY: bbox.top + 30
    });
    expect(canvas._cfg.el.style.cursor).to.equal('pointer');
    expect(count).to.equal(1);
    circle.destroy();
    circle.emit('mousedown', { target: circle });
  });
  it('click & contextmenu', () => {
    let clicked = false;
    let contextmenu = false;
    const bbox = canvas._cfg.el.getBoundingClientRect();
    const circle = canvas.addShape('circle', {
      attrs: {
        x: 50,
        y: 50,
        r: 30,
        fill: '#ccc',
        cursor: 'pointer'
      }
    });
    canvas.draw();
    circle.on('click', () => {
      clicked = true;
    });
    circle.on('contextmenu', () => {
      contextmenu = true;
    });
    Simulate.simulate(canvas._cfg.el, 'mousedown', {
      clientX: bbox.left + 30,
      clientY: bbox.top + 30
    });
    Simulate.simulate(canvas._cfg.el, 'mouseup', {
      clientX: bbox.left + 30,
      clientY: bbox.top + 30
    });
    expect(clicked).to.be.true;
    clicked = false;
    const event = new window.MouseEvent('contextmenu', {
      clientX: bbox.left + 30,
      clientY: bbox.top + 30
    });
    canvas._cfg.el.dispatchEvent(event);
    expect(clicked).to.be.false;
    expect(contextmenu).to.be.true;
  });
  it('cursor style', () => {
    canvas.addShape('circle', {
      attrs: {
        x: 100,
        y: 100,
        r: 30,
        fill: '#ccc',
        cursor: 'pointer'
      }
    });
    const el = canvas._cfg.el;
    const bbox = el.getBoundingClientRect();
    Simulate.simulate(canvas._cfg.el, 'mousemove', {
      clientX: bbox.left + 80,
      clientY: bbox.top + 80
    });
    expect(el.style.cursor).to.equal('pointer');
    Simulate.simulate(canvas._cfg.el, 'mousemove', {
      clientX: bbox.left + 160,
      clientY: bbox.top + 160
    });
    expect(el.style.cursor).to.equal('default');
  });
});
