const Util = require('../util/index');

const regexTags = /[MLHVQTCSAZ]([^MLHVQTCSAZ]*)/ig;
const regexDot = /[^\s\,]+/ig;
const regexLG = /^l\s*\(\s*([\d.]+)\s*\)\s*(.*)/i;
const regexRG = /^r\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)\s*(.*)/i;
const regexPR = /^p\s*\(\s*([axyn])\s*\)\s*(.*)/i;
const regexColorStop = /[\d.]+:(#[^\s]+|[^\)]+\))/ig;
const numColorCache = {};

function addStop(steps, el) {
  const arr = steps.match(regexColorStop);
  let stops = [];
  Util.each(arr, function(item) {
    item = item.split(':');
    const node = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    node.setAttribute('offset', item[0]);
    node.setAttribute('stop-color', item[1]);
    el.appendChild(node);
  });
  return stops;
}

function parsePattern(color, self) {
  if (self.get('patternSource') && self.get('patternSource') === color) {
    return self.get('pattern');
  }
  let pattern;
  let img;
  const arr = regexPR.exec(color);
  let repeat = arr[1];
  const source = arr[2];

  // Function to be called when pattern loads
  function onload() {
    // Create pattern
    const context = self.get('context');
    pattern = context.createPattern(img, repeat);
    self.setSilent('pattern', pattern); // be a cache
    self.setSilent('patternSource', color);
  }

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

  img = new Image();
  // If source URL is not a data URL
  if (!source.match(/^data:/i)) {
    // Set crossOrigin for this image
    img.crossOrigin = 'Anonymous';
  }
  img.src = source;

  if (img.complete) {
    onload();
  } else {
    img.onload = onload;
    // Fix onload() bug in IE9
    img.src = img.src;
  }

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
  parseLineGradient(color, el) {
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
    addStop(steps, el);
  },
  parseRadialGradient(color, self) {
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
  const gradient = context.createRadialGradient(box.minX + width * fx, box.minY + height * fy, fr * r, box.minX + width / 2, box.minY + height / 2, r);
  addStop(steps, gradient);
  return gradient;
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
