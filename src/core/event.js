const Util = require('../util/index');
const Event = require('../event');
const EVENTS = [
  'click',
  'mousedown',
  'mouseup',
  'dblclick',
  'contextmenu',
  'mouseenter',
  'mouseout',
  'mouseover',
  'mousemove',
  'mouseleave'
];

let preShape = null;

module.exports = {
  registerEvent() {
    const self = this;
    const el = this.get('el');

    Util.each(EVENTS, evt => {
      el.addEventListener(evt, e => {
        self._triggerEvent(evt, e);
      }, false);
    });
    // special cases
    el.addEventListener('touchstart', e => {
      if (!Util.isEmpty(e.touches)) {
        self._triggerEvent('touchstart', e.touches[0]);
      }
    }, false);

    el.addEventListener('touchmove', e => {
      if (!Util.isEmpty(e.touches)) {
        self._triggerEvent('touchmove', e.touches[0]);
      }
    }, false);

    el.addEventListener('touchend', e => {
      if (!Util.isEmpty(e.changedTouches)) {
        self._triggerEvent('touchend', e.changedTouches[0]);
      }
    }, false);
  },
  _getEmitter(element, event) {
    if (element) {
      if (Util.isEmpty(element._getEvents())) {
        const parent = element.get('parent');
        if (parent && !event.propagationStopped) {
          return this._getEmitter(parent, event);
        }
      } else {
        return element;
      }
    }
  },
  _getEventObj(type, e, point, target) {
    const event = new Event(type, e, true, true);
    event.x = point.x;
    event.y = point.y;
    event.clientX = e.clientX;
    event.clientY = e.clientY;
    event.currentTarget = target;
    event.target = target;
    return event;
  },
  _triggerEvent(type, e) {
    const point = this.getPointByClient(e.clientX, e.clientY);
    const shape = this.getShape(point.x, point.y, e);
    const el = this.get('el');
    let emitObj;
    if (type === 'mousemove') {
      if (preShape && preShape !== shape) {
        const mouseleave = this._getEventObj('mouseleave', e, point, preShape);
        emitObj = this._getEmitter(preShape, e);
        if (emitObj) {
          emitObj.emit('mouseleave', mouseleave);
          while (emitObj) {
            emitObj.emit('mouseout', mouseleave);
            emitObj = emitObj._cfg.parent;
          }
        }
        el.style.cursor = 'default';
      }
      if (shape) {
        const mousemove = this._getEventObj('mousemove', e, point, shape);
        emitObj = this._getEmitter(shape, e);
        emitObj && emitObj.emit('mousemove', mousemove);

        if (preShape !== shape) {
          const mouseenter = this._getEventObj('mouseenter', e, point, shape);
          if (emitObj) {
            emitObj.emit('mouseenter', mouseenter, e);
            while (emitObj) {
              emitObj.emit('mouseover', mouseenter);
              emitObj = emitObj._cfg.parent;
            }
          }
        }
      } else {
        const canvasmousemove = this._getEventObj('mousemove', e, point, this);
        this.emit('mousemove', canvasmousemove);
      }
      preShape = shape;
    } else {
      emitObj = this._emitEvent(type, e, point, shape || this);
    }
    if (shape && !shape.destroyed) {
      el.style.cursor = shape.attr('cursor') || 'default';
    }
  },
  _emitEvent(type, evt, point, shape) {
    const event = this._getEventObj(type, evt, point, shape);
    let emitShape = this._getEmitter(shape, evt);
    while (emitShape && !emitShape.destroyed && !emitShape.removed) {
      emitShape.emit(type, event);
      if (emitShape._cfg && emitShape._cfg.parent) {
        emitShape = emitShape._cfg.parent;
      } else {
        emitShape = null;
      }
    }
    return emitShape;
  }
};

