const Util = require('../util/index');
const GColor = require('@ali/g-color');

const regexTags = /[MLHVQTCSAZ]([^MLHVQTCSAZ]*)/ig;
const regexDot = /[^\s\,]+/ig;
const regexLG = /^l\s*\(\s*([\d.]+)\s*\)\s*(.*)/i;
const regexRG = /^r\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)\s*(.*)/i;
const regexPR = /^p\s*([axyn])\s+(.*)/i;
const regexColorStop = /[\d.]+:(#[^\s]+|[^\)]+\))/ig;
const numColorCache = {};

function multiplyOpacity(color, opacity) {
  if (opacity === undefined) {
    return color;
  }
  color = new GColor(color);
  color.multiplyA(opacity);
  const type = color.getType();
  if (type === 'hsl') {
    return color.getHSLStyle();
  } else if (type === 'rgb') {
    return color.getRGBStyle();
  }
}

function addStop(steps, gradient, opacity) {
  const arr = steps.match(regexColorStop);
  Util.each(arr, function(item) {
    item = item.split(':');
    const color = multiplyOpacity(item[1], opacity);
    gradient.addColorStop(item[0], color);
  });
}

function parseLineGradient(color, self, opacity) {
  const arr = regexLG.exec(color);
  const angle = Util.mod(Util.toRadian(parseFloat(arr[1])), Math.PI * 2);
  const steps = arr[2];
  const box = self.getBBox();
  let start;
  let end;

  if (angle >= 0 && angle < 0.5 * Math.PI) {
    start = {
      x: box.minX,
      y: box.minY
    };
    end = {
      x: box.maxX,
      y: box.maxY
    };
  } else if (0.5 * Math.PI <= angle && angle < Math.PI) {
    start = {
      x: box.maxX,
      y: box.minY
    };
    end = {
      x: box.minX,
      y: box.maxY
    };
  } else if (Math.PI <= angle && angle < 1.5 * Math.PI) {
    start = {
      x: box.maxX,
      y: box.maxY
    };
    end = {
      x: box.minX,
      y: box.minY
    };
  } else {
    start = {
      x: box.minX,
      y: box.maxY
    };
    end = {
      x: box.maxX,
      y: box.minY
    };
  }

  const tanTheta = Math.tan(angle);
  const tanTheta2 = tanTheta * tanTheta;

  const x = ((end.x - start.x) + tanTheta * (end.y - start.y)) / (tanTheta2 + 1) + start.x;
  const y = tanTheta * ((end.x - start.x) + tanTheta * (end.y - start.y)) / (tanTheta2 + 1) + start.y;
  const context = self.get('context');
  const gradient = context.createLinearGradient(start.x, start.y, x, y);
  addStop(steps, gradient, opacity);
  return gradient;
}

function parseRadialGradient(color, self, opacity) {
  const arr = regexRG.exec(color);
  const fx = parseFloat(arr[1]);
  const fy = parseFloat(arr[2]);
  const fr = parseFloat(arr[3]);
  const steps = arr[4];
  const box = self.getBBox();
  const context = self.get('context');
  const width = box.maxX - box.minX;
  const height = box.maxY - box.minY;
  const r = Math.sqrt(width * width + height * height) / 2;
  const gradient = context.createRadialGradient(box.minX + width * fx, box.minY + height * fy, fr, box.minX + width / 2, box.minY + height / 2, r);
  addStop(steps, gradient, opacity);
  return gradient;
}

function parsePattern(color, self) {
  const arr = regexPR.exec(color);
  let repeat = arr[1];
  const id = arr[2];
  switch (repeat) {
    case 'a':
      repeat = 'repeat';
      break;
    case 'x':
      repeat = 'repeat-x';
      break;
    case 'y':
      repeat = 'repeat-y';
      break;
    case 'n':
      repeat = 'no-repeat';
      break;
    default:
      repeat = 'no-repeat';
  }
  const img = document.getElementById(id);
  const context = self.get('context');
  const pattern = context.createPattern(img, repeat);
  return pattern;
}

module.exports = {
  parsePath(path) {
    path = path || [];
    if (Util.isArray(path)) {
      return path;
    }

    if (Util.isString(path)) {
      path = path.match(regexTags);
      Util.each(path, function(item, index) {
        item = item.match(regexDot);
        if (item[0].length > 1) {
          const tag = item[0].charAt(0);
          item.splice(1, 0, item[0].substr(1));
          item[0] = tag;
        }
        Util.each(item, function(sub, i) {
          if (!isNaN(sub)) {
            item[i] = +sub;
          }
        });
        path[index] = item;
      });
      return path;
    }
  },
  parseStyle(color, self, opacity) {
    if (Util.isString(color)) {
      if (color[1] === '(' || color[2] === '(') {
        if (color[0] === 'l') { // regexLG.test(color)
          return parseLineGradient(color, self, opacity);
        } else if (color[0] === 'r') { // regexRG.test(color)
          return parseRadialGradient(color, self, opacity);
        } else if (color[0] === 'p') { // regexPR.test(color)
          return parsePattern(color, self);
        }
      }
      if (Util.isNil(opacity)) {
        return color;
      }
      return multiplyOpacity(color, opacity);
    }
  },
  numberToColor(num) {
    // 增加缓存
    let color = numColorCache[num];
    if (!color) {
      let str = num.toString(16);
      for (let i = str.length; i < 6; i++) {
        str = '0' + str;
      }
      color = '#' + str;
      numColorCache[num] = color;
    }
    return color;
  }
};
