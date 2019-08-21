import { expect } from 'chai';
import * as G from '../../../../src/index';
const Simulate = require('event-simulate');

const div = document.createElement('div');
div.id = 'canvas-event';
document.body.appendChild(div);
const canvas = new G.Canvas({
  containerId: 'canvas-event',
  width: 1000,
  height: 1000,
  pixelRatio: 2,
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
    fill: 'red',
  },
});
canvas.draw();
describe('event emitter', () => {
  let count = 0;
  const fn1 = () => {
    count++;
  };
  const fn2 = () => {
    count++;
  };
  const fn3 = () => {
    count++;
  };
  it('on & emit & off', () => {
    const path = new G.Path();
    path.on('event', fn1);
    expect(path.getEvents().event).not.to.be.undefined;
    expect(path.getEvents().event.length).to.equal(1);
    expect(path.getEvents().event[0].callback).to.equal(fn1);
    expect(!!path.getEvents().event[0].once).to.be.false;
    path.once('event', fn2);
    expect(path.getEvents().event.length).to.equal(2);
    expect(path.getEvents().event[1].callback).to.equal(fn2);
    expect(!!path.getEvents().event[1].once).to.be.true;
    path.on('event', fn3);
    expect(path.getEvents().event.length).to.equal(3);
    expect(path.getEvents().event[2].callback).to.equal(fn3);
    expect(!!path.getEvents().event[2].once).to.be.false;
    path.emit('event');
    expect(path.getEvents().event.length).to.equal(2);
    expect(path.getEvents().event[0].callback).to.equal(fn1);
    expect(path.getEvents().event[1].callback).to.equal(fn3);
    expect(count).to.equal(3);
    path.off('event', fn1);
    expect(path.getEvents().event.length).to.equal(1);
    expect(path.getEvents().event[0].callback).to.equal(fn3);
    path.off('event');
    expect(path.getEvents().event).to.be.undefined;
  });
});
describe('event dispatcher', () => {
  it('single event of a type', () => {
    const bbox = canvas.cfg.el.getBoundingClientRect();
    let clicked = false;
    let evt = null;
    rect.on('click', function(event) {
      clicked = true;
      evt = event;
    });
    Simulate.simulate(canvas.cfg.el, 'click', {
      clientY: bbox.top + 5,
      clientX: bbox.left + 5,
    });
    expect(clicked).to.be.true;
    expect(evt).not.to.be.null;
  });
  it('multiple event of the same type', () => {
    const bbox = canvas.cfg.el.getBoundingClientRect();
    let clicked1 = false;
    let clicked2 = false;
    rect.on('click', function() {
      clicked1 = true;
    });
    rect.on('click', function() {
      clicked2 = true;
    });
    Simulate.simulate(canvas.cfg.el, 'click', {
      clientY: bbox.top + 5,
      clientX: bbox.left + 5,
    });
    rect.off('click');
    expect(clicked1).to.be.true;
    expect(clicked2).to.be.true;
  });
  it('event bubbling', () => {
    const bbox = canvas.cfg.el.getBoundingClientRect();
    let rectClicked = false;
    let groupClicked = false;
    let canvasClicked = false;
    let count = 0;
    rect.on('mousedown', function() {
      rectClicked = true;
      count += 1;
    });
    group.on('mousedown', function() {
      groupClicked = true;
    });
    canvas.on('mousedown', function() {
      canvasClicked = true;
    });
    Simulate.simulate(canvas.cfg.el, 'mousedown', {
      clientY: bbox.top + 5,
      clientX: bbox.left + 5,
    });
    rect.off('mousedown');
    group.off('mousedown');
    expect(rectClicked).to.be.true;
    expect(groupClicked).to.be.true;
    expect(canvasClicked).to.be.true;
    expect(count).to.equal(1);
  });
  it('mouseenter & mouseleave do not propagate', () => {
    const bbox = canvas.cfg.el.getBoundingClientRect();
    let rectEnter = false;
    let groupEnter = false;
    let rectLeave = false;
    let groupLeave = false;
    rect.on('mouseenter', (evt) => {
      rectEnter = true;
      expect(evt).not.to.be.undefined;
    });
    rect.on('mouseleave', (evt) => {
      rectLeave = true;
      expect(evt).not.to.be.undefined;
    });
    group.on('mouseenter', () => {
      groupEnter = true;
    });
    group.on('mouseleave', () => {
      groupLeave = true;
    });
    Simulate.simulate(canvas.cfg.el, 'mousemove', {
      clientY: bbox.top + 5,
      clientX: bbox.left + 5,
    });
    Simulate.simulate(canvas.cfg.el, 'mousemove', {
      clientY: bbox.top + 50,
      clientX: bbox.left + 50,
    });
    expect(rectEnter).to.be.true;
    expect(rectLeave).to.be.true;
    expect(groupEnter).to.be.false;
    expect(groupLeave).to.be.false;
    rect.off();
    group.off();
  });
  it('mouseover & mouseout do propagate', () => {
    const bbox = canvas.cfg.el.getBoundingClientRect();
    let rectEnter = false;
    let groupEnter = false;
    let rectLeave = false;
    let groupLeave = false;
    rect.on('mouseover', (evt) => {
      rectEnter = true;
      expect(evt).not.to.be.undefined;
    });
    rect.on('mouseout', (evt) => {
      rectLeave = true;
      expect(evt).not.to.be.undefined;
    });
    group.on('mouseover', () => {
      groupEnter = true;
    });
    group.on('mouseout', () => {
      groupLeave = true;
    });
    Simulate.simulate(canvas.cfg.el, 'mousemove', {
      clientY: bbox.top + 5,
      clientX: bbox.left + 5,
    });
    Simulate.simulate(canvas.cfg.el, 'mousemove', {
      clientY: bbox.top + 50,
      clientX: bbox.left + 50,
    });
    expect(rectEnter).to.be.true;
    expect(rectLeave).to.be.true;
    expect(groupEnter).to.be.true;
    expect(groupLeave).to.be.true;
  });
  it('off envent', () => {
    const bbox = canvas.cfg.el.getBoundingClientRect();
    let emited = false;
    const fn = function() {
      emited = true;
    };
    rect.on('mouseup', fn);
    Simulate.simulate(canvas.cfg.el, 'mouseup', {
      clientY: bbox.top + 5,
      clientX: bbox.left + 5,
    });
    expect(emited).to.be.true;
    emited = false;
    rect.off('mouseup', fn);
    Simulate.simulate(canvas.cfg.el, 'mouseup', {
      clientY: bbox.top + 5,
      clientX: bbox.left + 5,
    });
    expect(emited).to.be.false;
  });
  it('remove all listeners', () => {
    const bbox = canvas.cfg.el.getBoundingClientRect();
    let count = 0;
    rect.on('mouseup', () => {
      ++count;
    });
    rect.on('mouseup', () => {
      ++count;
    });
    Simulate.simulate(canvas.cfg.el, 'mouseup', {
      clientY: bbox.top + 5,
      clientX: bbox.left + 5,
    });
    expect(count).to.equal(2);

    rect.off('mouseup');
    Simulate.simulate(canvas.cfg.el, 'mouseup', {
      clientY: bbox.top + 5,
      clientX: bbox.left + 5,
    });
    expect(count).to.equal(2);
  });
  it('dragstart & dragend', () => {
    const bbox = canvas.cfg.el.getBoundingClientRect();
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
      ++count;
    });
    Simulate.simulate(canvas.cfg.el, 'mousedown', {
      clientY: bbox.top + 5,
      clientX: bbox.left + 5,
    });
    expect(rectDrag).to.be.false;
    expect(groupDrag).to.be.false;
    expect(rectEnd).to.be.false;
    expect(groupEnd).to.be.false;
    Simulate.simulate(canvas.cfg.el, 'mousemove', {
      clientY: bbox.top + 5,
      clientX: bbox.left + 5,
    });
    expect(rectDrag).to.be.true;
    expect(groupDrag).to.be.true;
    expect(rectEnd).to.be.false;
    expect(groupEnd).to.be.false;
    Simulate.simulate(canvas.cfg.el, 'mousemove', {
      clientY: bbox.top + 10,
      clientX: bbox.left + 10,
    });
    expect(count).to.equal(1);
    Simulate.simulate(canvas.cfg.el, 'mouseup', {
      clientY: bbox.top + 12,
      clientX: bbox.left + 12,
    });
    rect.off();
    group.off();
    expect(rectEnd).to.be.true;
    expect(groupEnd).to.be.true;
  });
  it('dragenter & dragleave', () => {
    const bbox = canvas.cfg.el.getBoundingClientRect();
    const circle = canvas.addShape('circle', {
      attrs: {
        x: 50,
        y: 50,
        r: 30,
        fill: '#ccc',
      },
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
    Simulate.simulate(canvas.cfg.el, 'mousedown', {
      clientY: bbox.top + 5,
      clientX: bbox.left + 5,
    });
    Simulate.simulate(canvas.cfg.el, 'mousemove', {
      clientY: bbox.top + 10,
      clientX: bbox.left + 10,
    });
    Simulate.simulate(canvas.cfg.el, 'mousemove', {
      clientY: bbox.top + 15,
      clientX: bbox.left + 15,
    });
    Simulate.simulate(canvas.cfg.el, 'mousemove', {
      clientY: bbox.top + 50,
      clientX: bbox.left + 50,
    });
    Simulate.simulate(canvas.cfg.el, 'mousemove', {
      clientY: bbox.top + 250,
      clientX: bbox.left + 250,
    });
    expect(enter).to.be.true;
    expect(leave).to.be.true;
  });
  it('drop shape', () => {
    const bbox = canvas.cfg.el.getBoundingClientRect();
    const circle = canvas.addShape('circle', {
      attrs: {
        x: 50,
        y: 50,
        r: 30,
        fill: '#ccc',
      },
    });
    canvas.draw();
    let target = null;
    circle.on('drop', (evt) => {
      target = evt.currentTarget;
    });
    Simulate.simulate(canvas.cfg.el, 'mousedown', {
      clientY: bbox.top + 5,
      clientX: bbox.left + 5,
    });
    Simulate.simulate(canvas.cfg.el, 'mousemove', {
      clientY: bbox.top + 10,
      clientX: bbox.left + 10,
    });
    Simulate.simulate(canvas.cfg.el, 'mousemove', {
      clientY: bbox.top + 15,
      clientX: bbox.left + 15,
    });
    Simulate.simulate(canvas.cfg.el, 'mouseup', {
      clientY: bbox.top + 50,
      clientX: bbox.left + 50,
    });
    expect(target).not.to.be.undefined;
    expect(target).to.equal(circle);
    circle.off('drop');
  });
});
