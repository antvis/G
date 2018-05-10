/**
 * Created by Elaine on 2018/5/9.
 */
const Util = require('../util/index');

const regexLG = /^l\s*\(\s*([\d.]+)\s*\)\s*(.*)/i;
const regexColorStop = /[\d.]+:(#[^\s]+|[^\)]+\))/ig;

function addStop(steps) {
  const arr = steps.match(regexColorStop);
  let stops = '';
  Util.each(arr, function(item) {
    item = item.split(':');
    stops += `<stop offset="${item[0]}" stop-color="${item[1]}"></stop>`;
  });
  return stops;
};

function parseLineGradient(color, el) {
  const arr = regexLG.exec(color);
  const angle = Util.mod(Util.toRadian(parseFloat(arr[1])), Math.PI * 2);
  const steps = arr[2];
  let start;
  let end;

  if (angle >= 0 && angle < 0.5 * Math.PI) {
    start = {
      x: 0,
      y: 0
    };
    end = {
      x: 1,
      y: 1
    };
  } else if (0.5 * Math.PI <= angle && angle < Math.PI) {
    start = {
      x: 1,
      y: 0
    };
    end = {
      x: 0,
      y: 1
    };
  } else if (Math.PI <= angle && angle < 1.5 * Math.PI) {
    start = {
      x: 1,
      y: 1
    };
    end = {
      x: 0,
      y: 0
    };
  } else {
    start = {
      x: 0,
      y: 1
    };
    end = {
      x: 1,
      y: 0
    };
  }

  const tanTheta = Math.tan(angle);
  const tanTheta2 = tanTheta * tanTheta;

  const x = ((end.x - start.x) + tanTheta * (end.y - start.y)) / (tanTheta2 + 1) + start.x;
  const y = tanTheta * ((end.x - start.x) + tanTheta * (end.y - start.y)) / (tanTheta2 + 1) + start.y;
  el.setAttribute('x1', start.x);
  el.setAttribute('y1', start.y);
  el.setAttribute('x2', x);
  el.setAttribute('y2', y);
  el.innerHTML = addStop(steps);
};

const LinearGradient = function(cfg) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    const id = Util.uniqueId('linear' + '_');
    el.setAttribute('id', id);
    parseLineGradient(cfg, el);
    this.__cfg = { el, id };
    this.__attrs = { config: cfg };
    return this;
};

Util.augment(LinearGradient, {
  type: 'gradient',
  match(type, attr) {
    return this.type === type && this.__attrs.config === attr;
  }
});

module.exports = LinearGradient;