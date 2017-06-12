const Util = require('./util/index');
const Event = require('@ali/g-event');

const MouseEvent = function(canvas) {
  this.canvas = canvas;
  this.el = canvas.get('el');
  this.current = null;
  this.pre = null;
};

Util.augment(MouseEvent, {
  tryTrigger(element, event) {
    if (element.__listeners) {
      element.trigger(event);
    } else {
      return;
    }
  },
  getCurrent(e) {
    const canvas = this.canvas;
    const point = canvas.getPointByClient(e.clientX, e.clientY);
    this.point = point;
    this.pre = this.current;
    this.current = canvas.getShape(point.x, point.y);
  },
  mousemove(e) {
    this.getCurrent(e);
    const point = this.point;
    const canvas = this.canvas;
    if (canvas.has('canvas-mousemove')) {
      const canvasmousemove = new Event('canvas-mousemove', e, true, true);
      canvasmousemove.x = point.x;
      canvasmousemove.y = point.y;
      canvasmousemove.clientX = e.clientX;
      canvasmousemove.clientY = e.clientY;
      canvasmousemove.currentTarget = canvas;
      this.tryTrigger(canvas, canvasmousemove);
    }

    if (this.pre && this.pre !== this.current) {
      const mouseleave = new Event('mouseleave', e, true, true);
      mouseleave.x = point.x;
      mouseleave.y = point.y;
      mouseleave.clientX = e.clientX;
      mouseleave.clientY = e.clientY;
      mouseleave.currentTarget = this.pre;
      mouseleave.target = this.pre;
      this.tryTrigger(this.pre, mouseleave);
    }

    if (this.current) {
      const mousemove = new Event('mousemove', e, true, true);
      mousemove.x = point.x;
      mousemove.y = point.y;
      mousemove.clientX = e.clientX;
      mousemove.clientY = e.clientY;
      mousemove.currentTarget = this.current;
      mousemove.target = this.current;
      this.tryTrigger(this.current, mousemove);

      if (this.pre !== this.current) {
        const mouseenter = new Event('mouseenter', e, true, true);
        mouseenter.x = point.x;
        mouseenter.y = point.y;
        mouseenter.clientX = e.clientX;
        mouseenter.clientY = e.clientY;
        mouseenter.currentTarget = this.current;
        mouseenter.target = this.current;
        this.tryTrigger(this.current, mouseenter);
      }
    }
  },
  mousedown(e) {
    const point = this.point;
    const canvas = this.canvas;

    if (canvas.has('canvas-mousedown')) {
      const canvasmousedown = new Event('canvas-mousedown', e, true, true);
      canvasmousedown.x = point.x;
      canvasmousedown.y = point.y;
      canvasmousedown.clientX = e.clientX;
      canvasmousedown.clientY = e.clientY;
      canvasmousedown.currentTarget = canvas;
      this.tryTrigger(canvas, canvasmousedown);
    }


    if (this.current) {
      const mousedown = new Event('mousedown', e, true, true);
      mousedown.x = point.x;
      mousedown.y = point.y;
      mousedown.clientX = e.clientX;
      mousedown.clientY = e.clientY;
      mousedown.currentTarget = this.current;
      mousedown.target = this.current;
      this.tryTrigger(this.current, mousedown);
    }
  },
  mouseup(e) {
    const point = this.point;
    const canvas = this.canvas;
    if (canvas.has('canvas-mouseup')) {
      const canvasmouseup = new Event('canvas-mouseup', e, true, true);
      canvasmouseup.x = point.x;
      canvasmouseup.y = point.y;
      canvasmouseup.clientX = e.clientX;
      canvasmouseup.clientY = e.clientY;
      canvasmouseup.currentTarget = canvas;
      this.tryTrigger(canvas, canvasmouseup);
    }
    if (this.current) {
      const mouseup = new Event('mouseup', e, true, true);
      mouseup.x = point.x;
      mouseup.y = point.y;
      mouseup.clientX = e.clientX;
      mouseup.clientY = e.clientY;
      mouseup.currentTarget = this.current;
      mouseup.target = this.current;
      this.tryTrigger(this.current, mouseup);
    }
  },
  click(e) {
    this.getCurrent(e);
    const point = this.point;
    const canvas = this.canvas;
    if (canvas.has('canvas-click')) {
      const canvasclick = new Event('canvas-click', e, true, true);
      canvasclick.x = point.x;
      canvasclick.y = point.y;
      canvasclick.clientX = e.clientX;
      canvasclick.clientY = e.clientY;
      canvasclick.currentTarget = canvas;
      this.tryTrigger(canvas, canvasclick);
    }

    if (this.current) {
      const click = new Event('click', e, true, true);
      click.x = point.x;
      click.y = point.y;
      click.clientX = e.clientX;
      click.clientY = e.clientY;
      click.currentTarget = this.current;
      click.target = this.current;
      this.tryTrigger(this.current, click);
    }
  },
  dblclick(e) {
    const point = this.point;
    const canvas = this.canvas;

    if (canvas.has('canvas-dblclick')) {
      const canvasdblclick = new Event('canvas-dblclick', e, true, true);
      canvasdblclick.x = point.x;
      canvasdblclick.y = point.y;
      canvasdblclick.clientX = e.clientX;
      canvasdblclick.clientY = e.clientY;
      canvasdblclick.currentTarget = canvas;
      this.tryTrigger(canvas, canvasdblclick);
    }


    if (this.current) {
      const dblclick = new Event('dblclick', e, true, true);
      dblclick.x = point.x;
      dblclick.y = point.y;
      dblclick.clientX = e.clientX;
      dblclick.clientY = e.clientY;
      dblclick.currentTarget = this.current;
      dblclick.target = this.current;
      this.tryTrigger(this.current, dblclick);
    }
  },
  mouseout(e) {
    const point = this.point;
    const canvas = this.canvas;

    const canvasmouseleave = new Event('canvas-mouseleave', e, true, true);
    canvasmouseleave.x = point.x;
    canvasmouseleave.y = point.y;
    canvasmouseleave.currentTarget = canvas;
    this.tryTrigger(canvas, canvasmouseleave);
  },
  mouseover(e) {
    const canvas = this.canvas;

    const canvasmouseenter = new Event('canvas-mouseenter', e, true, true);
    canvasmouseenter.currentTarget = canvas;
    this.tryTrigger(canvas, canvasmouseenter);
  }
});

module.exports = MouseEvent;
