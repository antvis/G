var Util = require('../util/index');
var GColor = require('@ali/g-color');

var regexTags = /[MLHVQTCSAZ]([^MLHVQTCSAZ]*)/ig;
var regexDot = /[^\s\,]+/ig;
var regexLG = /^l\s*\(\s*([\d.]+)\s*\)\s*(.*)/i;
var regexRG = /^r\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)\s*(.*)/i;
var regexPR = /^p\s*([axyn])\s+(.*)/i;
var regexColorStop = /[\d.]+:(#[^\s]+|[^\)]+\))/ig;
var numColorCache = {};

function multiplyOpacity(color, opacity) {
  if (opacity === undefined) {
    return color;
  }
  color = new GColor(color);
  color.multiplyA(opacity);
  var type = color.getType();
  if (type === 'hsl') {
    return color.getHSLStyle();
  } else if (type === 'rgb') {
    return color.getRGBStyle();
  }
}

function addStop(steps, gradient, opacity) {
  var arr = steps.match(regexColorStop);
  Util.each(arr, function(item) {
    item = item.split(':');
    var color = multiplyOpacity(item[1], opacity);
    gradient.addColorStop(item[0], color);
  });
}

function parseLineGradient(color, self, opacity) {
  var arr = regexLG.exec(color);
  var angle = Util.mod(Util.toRadian(parseFloat(arr[1])), Math.PI * 2);
  var steps = arr[2];
  var box = self.getBBox();
  var start;
  var end;

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

  var tanTheta = Math.tan(angle);
  var tanTheta2 = tanTheta * tanTheta;

  var x = ((end.x - start.x) + tanTheta * (end.y - start.y)) / (tanTheta2 + 1) + start.x;
  var y = tanTheta * ((end.x - start.x) + tanTheta * (end.y - start.y)) / (tanTheta2 + 1) + start.y;
  var context = self.get('context');
  var gradient = context.createLinearGradient(start.x, start.y, x, y);
  addStop(steps, gradient, opacity);
  return gradient;
}

function parseRadialGradient(color, self, opacity) {
  var arr = regexRG.exec(color);
  var fx = parseFloat(arr[1]);
  var fy = parseFloat(arr[2]);
  var fr = parseFloat(arr[3]);
  var steps = arr[4];
  var box = self.getBBox();
  var context = self.get('context');
  var width = box.maxX - box.minX;
  var height = box.maxY - box.minY;
  var r = Math.sqrt(width * width + height * height) / 2;
  var gradient = context.createRadialGradient(box.minX + width * fx, box.minY + height * fy, fr, box.minX + width / 2, box.minY + height / 2, r);
  addStop(steps, gradient, opacity);
  return gradient;
}

function parsePattern(color, self) {
  var arr = regexPR.exec(color);
  var repeat = arr[1];
  var id = arr[2];
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
  var img = document.getElementById(id);
  var context = self.get('context');
  var pattern = context.createPattern(img, repeat);
  return pattern;
}

module.exports = {
  parsePath: function(path) {
    path = path || [];
    if (Util.isArray(path)) {
      return path;
    }

    if (Util.isString(path)) {
      path = path.match(regexTags);
      Util.each(path, function(item, index) {
        item = item.match(regexDot);
        if (item[0].length > 1) {
          var tag = item[0].charAt(0);
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
  parseStyle: function(color, self, opacity) {
    if (Util.isString(color)) {
      if (color[1] === '(' || color[2] === '(') {
        if (color[0] === 'l') { // regexLG.test(color)
          return parseLineGradient(color, self, opacity);
        } else if (color[0] === 'r') { // regexRG.test(color)
          return parseRadialGradient(color, self, opacity);
        } else if (color[0] === 'p') {// regexPR.test(color)
          return parsePattern(color, self);
        }
      }
      if (Util.isNil(opacity)) {
        return color;
      }
      return multiplyOpacity(color, opacity);
    }
  },
  numberToColor: function(num) {
    // 增加缓存
    var color = numColorCache[num];
    if (!color) {
      var str = num.toString(16);
      for (var i = str.length; i < 6; i++) {
        str = '0' + str;
      }
      color = '#' + str;
      numColorCache[num] = color;
    }
    return color;
  }
};
