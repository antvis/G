/**
 * Created by Elaine on 2018/5/10.
 */
const Util = require('../util/index');

const regexRG = /^r\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)\s*(.*)/i;
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

function parseRadialGradient(color, self) {
  const arr = regexRG.exec(color);
  const cx = parseFloat(arr[1]);
  const cy = parseFloat(arr[2]);
  const r = parseFloat(arr[3]);
  const steps = arr[4];
  self.setAttribute('cx', cx);
  self.setAttribute('cy', cy);
  self.setAttribute('r', r);
  self.innerHTML = addStop(steps);
};

const RadialGradient = function(cfg) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
  const id = Util.uniqueId('radial' + '_');
  el.setAttribute('id', id);
  parseRadialGradient(cfg, el);
  this.__cfg = { el, id };
  this.__attrs = { config: cfg };
  return this;
}
Util.augment(RadialGradient, {
  type: 'gradient',
  match(type, attr) {
    return this.type === type && this.__attrs.config === attr;
  }
});

module.exports = RadialGradient;