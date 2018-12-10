const expect = require('chai').expect;
const G = require('../../../../src/index');
const Simulate = require('event-simulate');

const div = document.createElement('div');
div.id = 'canvas-animate';
document.body.appendChild(div);
const canvas = new G.Canvas({
  containerId: 'canvas-animate',
  width: 1000,
  height: 1000,
  pixelRatio: 2
});
const group = canvas.addGroup();
const rect = group.addShape('rect', {
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
describe('event', () => {
  it('single event of a type', () => {
    const bbox = canvas._cfg.el.getBoundingClientRect();
    let clicked = false;
    let evt = null;
    rect.on('click', function(event) {
      clicked = true;
      evt = event;
    });
    Simulate.simulate(canvas._cfg.el, 'click', {
      clientY: bbox.top + 5,
      clientX: bbox.left + 5
    });
    expect(clicked).to.be.true;
    expect(evt).not.to.be.null;
  });
  it('multiple event of the same type', () => {
    const bbox = canvas._cfg.el.getBoundingClientRect();
    let clicked1 = false;
    let clicked2 = false;
    rect.on('click', function() {
      clicked1 = true;
    });
    rect.on('click', function() {
      clicked2 = true;
    });
    Simulate.simulate(canvas._cfg.el, 'click', {
      clientY: bbox.top + 5,
      clientX: bbox.left + 5
    });
    rect.removeEvent('click');
    expect(clicked1).to.be.true;
    expect(clicked2).to.be.true;
  });
  it('event bubbling', () => {
    const bbox = canvas._cfg.el.getBoundingClientRect();
    let rectClicked = false;
    let groupClicked = false;
    rect.on('mousedown', function() {
      rectClicked = true;
    });
    group.on('mousedown', function() {
      groupClicked = true;
    });
    Simulate.simulate(canvas._cfg.el, 'mousedown', {
      clientY: bbox.top + 5,
      clientX: bbox.left + 5
    });
    rect.removeEvent('mousedown');
    group.removeEvent('mousedown');
    expect(rectClicked).to.be.true;
    expect(groupClicked).to.be.true;
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
    rect.removeAllListeners();
    group.removeAllListeners();
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
    Simulate.simulate(canvas._cfg.el, 'mousedown', {
      clientY: bbox.top + 5,
      clientX: bbox.left + 5
    });
    expect(rectDrag).to.be.false;
    expect(groupDrag).to.be.false;
    expect(rectEnd).to.be.false;
    expect(groupEnd).to.be.false;
    Simulate.simulate(canvas._cfg.el, 'mousemove', {
      clientY: bbox.top + 5,
      clientX: bbox.left + 5
    });
    expect(rectDrag).to.be.true;
    expect(groupDrag).to.be.true;
    expect(rectEnd).to.be.false;
    expect(groupEnd).to.be.false;
    Simulate.simulate(canvas._cfg.el, 'mousemove', {
      clientY: bbox.top + 10,
      clientX: bbox.left + 10
    });
    expect(count).to.equal(1);
    Simulate.simulate(canvas._cfg.el, 'mouseup', {
      clientY: bbox.top + 12,
      clientX: bbox.left + 12
    });
    expect(rectEnd).to.be.true;
    expect(groupEnd).to.be.true;
  });
});
