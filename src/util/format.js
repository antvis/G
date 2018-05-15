const Util = require('../util/index');

const regexTags = /[MLHVQTCSAZ]([^MLHVQTCSAZ]*)/ig;
const regexDot = /[^\s\,]+/ig;
const regexPR = /^p\s*\(\s*([axyn])\s*\)\s*(.*)/i;
const numColorCache = {};

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
      Util.each(path, (item, index) => {
        item = item.match(regexDot);
        if (item[0].length > 1) {
          const tag = item[0].charAt(0);
          item.splice(1, 0, item[0].substr(1));
          item[0] = tag;
        }
        Util.each(item, (sub, i) => {
          if (!isNaN(sub)) {
            item[i] = +sub;
          }
        });
        path[index] = item;
      });
      return path;
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
